import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Session } from './schemas/session.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    @InjectModel(Session.name) private sessionModel: Model<any>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async login(loginDto: LoginDto, req: any) {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (
      !user ||
      !(await this.usersService.validatePassword(
        loginDto.password,
        user.password,
      ))
    ) {
      await this.auditLogsService.log({
        action: 'auth.login.failed',
        resource: 'Auth',
        metadata: { email: loginDto.email },
        request: req,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      await this.auditLogsService.log({
        action: 'auth.login.failed',
        resource: 'Auth',
        metadata: { email: loginDto.email, reason: 'User disabled' },
        request: req,
      });
      throw new UnauthorizedException('User is disabled');
    }

    const sessionId = new Types.ObjectId();
    const tokens = await this.generateTokens(user, sessionId.toString());

    await this.sessionModel.create({
      _id: sessionId,
      userId: user._id,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
      ipAddress:
        req.ip ||
        req.headers?.['x-forwarded-for'] ||
        req.connection?.remoteAddress,
      userAgent: req.headers?.['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    req.user = { userId: user._id.toString(), email: user.email };
    await this.auditLogsService.log({
      action: 'auth.login.success',
      resource: 'Auth',
      resourceId: user._id.toString(),
      request: req,
    });

    return {
      message: 'Login successful',
      data: {
        user: this.serializeUser(user),
        ...tokens,
      },
    };
  }

  async logout(req: any, refreshToken: string) {
    const userId = req.user?.userId;
    const payload = this.jwtService.decode(refreshToken);
    if (payload?.sid) {
      await this.sessionModel.updateOne(
        { _id: payload.sid, userId },
        { revokedAt: new Date(), refreshTokenHash: undefined },
      );
    }

    await this.auditLogsService.log({
      action: 'auth.logout',
      resource: 'Auth',
      resourceId: userId,
      request: req,
    });

    return { message: 'Logout successful', data: null };
  }

  async refreshTokens(refreshToken: string, ip?: string, userAgent?: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const session = await this.sessionModel.findOne({
      _id: payload.sid,
      userId: payload.sub,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!session || !session.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is disabled or not found');
    }

    if (!(await bcrypt.compare(refreshToken, session.refreshTokenHash))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.sessionModel.updateOne(
      { _id: session._id },
      { revokedAt: new Date(), refreshTokenHash: undefined },
    );

    const newSessionId = new Types.ObjectId();
    const tokens = await this.generateTokens(user, newSessionId.toString());

    await this.sessionModel.create({
      _id: newSessionId,
      userId: user._id,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
      ipAddress: ip,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { message: 'Token refreshed successfully', data: tokens };
  }

  async changePassword(req: any, changePasswordDto: ChangePasswordDto) {
    const userId = req.user?.userId;
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.usersService.findByEmailWithPassword(
      currentUser.email,
    );
    if (
      !user ||
      !(await this.usersService.validatePassword(
        changePasswordDto.currentPassword,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updatePassword(
      userId,
      changePasswordDto.newPassword,
    );
    await this.sessionModel.updateMany(
      { userId: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date(), refreshTokenHash: undefined },
    );

    await this.auditLogsService.log({
      action: 'auth.password.changed',
      resource: 'Auth',
      resourceId: userId,
      request: req,
    });

    return { message: 'Password changed successfully', data: null };
  }

  async forgotPassword(req: any, forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (user) {
      const token = randomBytes(32).toString('hex');
      await this.usersService.setPasswordResetToken(
        user._id.toString(),
        await bcrypt.hash(token, 10),
        new Date(Date.now() + 30 * 60 * 1000),
      );
      await this.mailService.sendPasswordReset(user.email, token);
    }

    await this.auditLogsService.log({
      action: 'auth.password.reset.requested',
      resource: 'Auth',
      metadata: { email: forgotPasswordDto.email },
      request: req,
    });

    return {
      message: 'If the email exists, a password reset token has been sent',
      data: null,
    };
  }

  async resetPassword(req: any, resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmailWithResetToken(
      resetPasswordDto.email,
    );

    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date() ||
      !(await bcrypt.compare(
        resetPasswordDto.token,
        user.passwordResetTokenHash,
      ))
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(
      user._id.toString(),
      resetPasswordDto.newPassword,
    );
    await this.sessionModel.updateMany(
      { userId: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date(), refreshTokenHash: undefined },
    );

    await this.auditLogsService.log({
      action: 'auth.password.reset.completed',
      resource: 'Auth',
      metadata: { email: resetPasswordDto.email },
      request: req,
    });

    return { message: 'Password reset successfully', data: null };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      message: 'User loaded successfully',
      data: this.serializeUser(user),
    };
  }

  private verifyRefreshToken(refreshToken: string): {
    sub: string;
    sid: string;
  } {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret') ?? '',
      });

      if (!payload.sub || !payload.sid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return { sub: payload.sub, sid: payload.sid };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: any, sessionId: string) {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
      sid: sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret') ?? '',
      expiresIn: this.configService.get<string>('jwt.accessExpiration') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret') ?? '',
      expiresIn: this.configService.get<string>('jwt.refreshExpiration') as any,
    });

    return { accessToken, refreshToken };
  }

  private serializeUser(user: any) {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
