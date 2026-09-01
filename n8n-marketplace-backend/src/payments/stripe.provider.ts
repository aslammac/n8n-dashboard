import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

// A single shared Stripe client. If no key is configured the client is still
// constructed (with a placeholder) so the app boots in dev; any real API call
// will fail clearly until STRIPE_SECRET_KEY is set.
export const StripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const key = config.get<string>('stripe.secretKey');
    if (!key) {
      new Logger('StripeProvider').warn(
        'STRIPE_SECRET_KEY is not set — payment endpoints will not work.',
      );
    }
    return new Stripe(key || 'sk_test_unconfigured');
  },
};
