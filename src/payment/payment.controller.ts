import { Controller, Post, Body, Req, Res, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Request, Response } from 'express';
import { AuthorizationDto } from './dto/authorize-payment.dto';
import { ValidationDTO } from './dto/validate-payment.dto';
import { Validate } from './entities/payment.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('activation')
  async activate(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const response = await this.paymentService.activate(createPaymentDto);
    if (typeof response === 'object') {
      req.session.auth_method = response.auth_method;
      req.session.fields = response.fields;
      req.session.charge_payload = response.charg_payload;

      switch (response.auth_method) {
        case 'pin':
          res.json({
            isSuccess: true,
            mode: response.auth_method,
            field: response.fields,
          });
          break;
        case 'avs_noauth':
          res.json({
            isSuccess: true,
            mode: response.auth_method,
            fields: response.fields,
          });
          break;
        case 'redirect':
          res.redirect(`/${response.auth_url}`);
          break;
        default:
          res.json({ isSuccess: false, message: 'payment failed' });
      }
    } else {
      switch (response) {
        case 'Payment Successful':
          res.json({ isSuccess: true, message: 'Payment Successfull' });
          break;
        case 'Payment Processing':
          res.json({ isSuccess: true, message: 'Payment pending' });
          break;
        default:
          res.json({ isSuccess: false, message: 'payment failed' });
      }
    }
  }

  @Post('authorization')
  async authorize(
    @Body() authorizationDto: AuthorizationDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload = req.session.charge_payload;
    payload.authorization = {
      mode: req.session.auth_method,
    };
    req.session.fields.forEach(
      (field) => (payload.authorization[field] = authorizationDto[field]),
    );
    const response = await this.paymentService.authorize(payload);

    if (typeof response === 'object') {
      switch (response.auth_method) {
        case 'otp':
          req.session.flw_ref = response.flw_ref;
          res.json({
            isSuccess: true,
            mode: response.auth_method,
          });
          break;
        case 'redirect':
          res.json({
            isSuccess: true,
            mode: response.auth_method,
            url: response.auth_url,
          });
          break;
        default:
          res.json({ isSuccess: false, message: 'payment failed' });
      }
    } else {
      switch (response) {
        case 'Payment Successfull':
          res.json({ isSuccess: true, message: 'Payment Successfull' });
          break;
        case 'Payment Processing':
          res.json({ isSuccess: true, message: 'Payment pending' });
          break;
        default:
          res.json({ isSuccess: false, message: 'payment failed' });
      }
    }
  }

  @Post('validation')
  async validate(
    @Body() validationDto: ValidationDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(req.session.flw_ref);
    const payload = {
      otp: validationDto.otp,
      flw_ref: req.session.flw_ref,
    } as Validate;
    const response = await this.paymentService.vadidate(payload);

    if (response === 'payment-successful') {
      return res.json({ isSucess: true, message: response });
    }

    if (response === 'payment-pending') {
      return res.json({ isSucess: false, message: response });
    }

    return res.json({ isSucess: false, message: response });
  }

  @Post('payment-redirect')
  async redirect(
    @Query('status') status: string,
    @Query('tx_ref') tx_ref: string,
    @Res() res: Response,
  ) {
    if (status === 'successfull' || status === 'pending') {
      const response = await this.paymentService.checkRedirect(tx_ref);
      if (response === 'payment-successful') {
        return res.json({ isSucess: true, message: response });
      }

      if (response === 'payment-pending') {
        return res.json({ isSucess: false, message: response });
      }
    }
    return res.json({ isSucess: false, message: 'payment Failed' });
  }
}
