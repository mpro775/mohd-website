import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';
import { PublicOptionsController, AdminOptionsController } from './options.controller';

@Module({
  controllers: [PublicOptionsController, AdminOptionsController],
  providers: [OptionsService],
  exports: [OptionsService],
})
export class OptionsModule {}
