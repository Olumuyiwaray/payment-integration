import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, FlutterwaveService],
})
export class PaymentModule {}
