import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [DemoController, PaymentsController],
  providers: [DemoService],
})
export class DemoModule {}