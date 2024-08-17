import { Injectable } from '@nestjs/common';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';
import { Payment, Validate } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(private flutterwaveService: FlutterwaveService) {}
  async activate(createPaymentDto: Payment) {
    return await this.flutterwaveService.chargeCard(createPaymentDto);
  }

  async authorize(payload: Payment) {
    return this.flutterwaveService.authorizePay(payload);
  }

  async vadidate(payload: Validate) {
    return this.flutterwaveService.validatePay(payload);
  }
}
