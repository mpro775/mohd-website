import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/auth/permissions.enum';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/clients')
export class PublicClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll() {
    const clients = await this.clientsService.findAll(false);
    return {
      message: 'Clients loaded successfully',
      data: clients,
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_PORTFOLIO)
@Controller('admin/clients')
export class AdminClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return {
      message: 'Client created successfully',
      data: client,
    };
  }

  @Get()
  async findAll() {
    const clients = await this.clientsService.findAll(true);
    return {
      message: 'Clients loaded successfully',
      data: clients,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const client = await this.clientsService.findOne(id);
    return {
      message: 'Client loaded successfully',
      data: client,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(id, updateClientDto);
    return {
      message: 'Client updated successfully',
      data: client,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.clientsService.remove(id);
    return { message: 'Client deleted successfully', data: null };
  }
}
