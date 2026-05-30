import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: Record<string, unknown>) => {
      delete ret.password;
      delete ret.passwordResetTokenHash;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: (doc, ret: Record<string, unknown>) => {
      delete ret.password;
      delete ret.passwordResetTokenHash;
      delete ret.__v;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ select: false })
  passwordResetTokenHash?: string;

  @Prop()
  passwordResetExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster queries
UserSchema.index({ email: 1 });
