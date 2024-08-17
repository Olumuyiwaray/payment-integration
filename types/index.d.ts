import 'express-session';
import { Payment } from 'src/payment/entities/payment.entity';

declare module 'express-session' {
  export interface SessionData {
    auth_method?: string;
    fields?: string[];
    auth_url: string;
    charge_payload?: Payment;
    flw_ref: string;
  }
}
