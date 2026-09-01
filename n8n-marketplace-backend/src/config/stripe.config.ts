import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  // Recurring price (Stripe Price ID) for the Pro subscription.
  proPriceId: process.env.STRIPE_PRO_PRICE_ID,
  // One-time price (Stripe Price ID) for lifetime access.
  lifetimePriceId: process.env.STRIPE_LIFETIME_PRICE_ID,
}));
