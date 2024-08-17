import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as Flutterwave from 'flutterwave-node-v3';
import { Payment, Validate } from 'src/payment/entities/payment.entity';

@Injectable()
export class FlutterwaveService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  private flw = new Flutterwave(
    this.configService.get<string>('PUBLIC_KEY'),
    this.configService.get<string>('SECRET_KEY'),
  );

  public async chargeCard(createPaymentEntity: Payment) {
    try {
      createPaymentEntity.enckey =
        this.configService.get<string>('ENCRYPTION_KEY');
      const response = await this.flw.Charge.card(createPaymentEntity);

      switch (response?.meta?.authorization?.mode) {
        case 'pin':
        case 'avs_noauth':
          return {
            auth_method: response.meta.authorization.mode,
            fields: response.meta.authorization.fields,
            charg_payload: createPaymentEntity,
          };
        case 'redirect':
          await this.cacheManager.set(
            `txref-${response.data.tx_ref}`,
            response.data.id,
          );
          return {
            auth_method: response.meta.authorization.mode,
            auth_url: response.meta.authorization.redirect,
          };
        default:
          const transactionId = response.data.id;
          const transaction = this.flw.Transaction.verify({
            id: transactionId,
          });

          if (transaction.data.status === 'successful') {
            return 'Payment Successful';
          } else if (transaction.data.status === 'pending') {
            // TODO: Add job queue here
            return 'Payment Processing';
          } else {
            return 'Payment Failed';
          }
      }
    } catch (error) {
      console.log(error);
    }
  }
  public async authorizePay(payload: Payment) {
    try {
      const response = await this.flw.Charge.card(payload);

      switch (response?.meta?.authorization?.mode) {
        case 'otp':
          return {
            auth_method: response.meta.authorization.mode,
            flw_ref: response.data.flw_ref,
          };
        case 'redirect':
          return {
            auth_method: response.meta.authorization.mode,
            auth_url: response.meta.authorization.redirect,
          };
        default:
          const transactionId = response.data.id;
          const transaction = await this.flw.Transaction.verify({
            id: transactionId,
          });
          if (transaction.data.status === 'successful') {
            return 'Payment Successfull';
          } else if (transaction.data.status === 'pending') {
            // TODO: Add job queue here
            return 'Payment Processing';
          } else {
            return 'Payment Failed';
          }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * name
   */
  public async validatePay(payload: Validate) {
    const response = await this.flw.Charge.validate(payload);

    if (
      response.data.status === 'successful' ||
      response.data.status === 'pending'
    ) {
      return await this.validate(response.data.id);
    }

    return 'payment-failed';
  }

  /**
   * name
   */
  public async checkRedirect(payload: string) {
    const transactionId: string = await this.cacheManager.get(
      `txref-${payload}`,
    );

    return await this.validate(transactionId);
  }

  private async validate(payload: string) {
    const transactionId = payload;
    const transaction = await this.flw.Transaction.verify({
      id: transactionId,
    });

    if (transaction.data.status === 'successful') {
      return 'payment-successful';
    }
    if (transaction.data.status === 'pending') {
      // set up job
      return 'payment-pending';
    }
  }
}
