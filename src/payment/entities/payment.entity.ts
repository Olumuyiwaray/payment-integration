export class Payment {
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  currency: string;
  amount: string;
  redirect_url: string;
  fullname: string;
  email: string;
  phone_number: string;
  enckey: string;
  tx_ref: string;
  authorization?: {
    mode: string;
    [key: string]: any;
  };
}

export class Authorize {
  auth_mode: string;
  pin?: string;
  city?: string;
  address?: string;
  state?: string;
  country?: string;
  zipcode?: string;
}

export class Validate {
  otp: string;
  flw_ref: string;
}
