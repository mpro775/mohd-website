import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MessageStatus } from './schemas/contact-message.schema';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller(['contact', 'public/contact'])
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @Throttle({ default: { ttl: 3600000, limit: 3 } })
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Ip() ip: string) {
    return {
      message: 'Message sent successfully',
      data: await this.contactService.create(createMessageDto, ip),
    };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/contact/messages')
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: MessageStatus,
  ) {
    const result = await this.contactService.findAll(page, limit, status);
    return {
      message: 'Messages loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Message loaded successfully',
      data: await this.contactService.findOne(id),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return {
      message: 'Message status updated successfully',
      data: await this.contactService.updateStatus(
        id,
        updateStatusDto.status,
        updateStatusDto.notes,
      ),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.contactService.remove(id);
    return { message: 'Message deleted successfully', data: null };
  }
}
