import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { UsersService } from '../users/users.service';
import { STRIPE_CLIENT } from './stripe.provider';

const PREMIUM_TIERS = ['starter', 'pro', 'business', 'lifetime'];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private frontendBaseUrl(): string {
    const raw = this.config.get<string>('app.frontendUrl') || '';
    return (raw.split(',')[0] || 'http://localhost:3000').trim().replace(/\/$/, '');
  }

  private async ensureCustomer(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found.');
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.fullName,
      metadata: { userId },
    });
    await this.usersService.setStripeCustomerId(userId, customer.id);
    return customer.id;
  }

  /** True if the user currently has full access to premium workflows. */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !PREMIUM_TIERS.includes(user.subscriptionTier)) return false;
    if (user.subscriptionTier === 'lifetime') return true;
    if (user.subscriptionStatus && user.subscriptionStatus !== 'active') return false;
    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt.getTime() < Date.now()) {
      return false;
    }
    return true;
  }

  async getBillingStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      tier: user?.subscriptionTier ?? 'free',
      status: user?.subscriptionStatus ?? null,
      expiresAt: user?.subscriptionExpiresAt ?? null,
      hasPremium: await this.hasPremiumAccess(userId),
    };
  }

  /** Recurring Pro subscription checkout. */
  async createSubscriptionCheckout(userId: string) {
    const priceId = this.config.get<string>('stripe.proPriceId');
    if (!priceId) {
      throw new BadRequestException('Pro plan price is not configured.');
    }
    if (await this.hasPremiumAccess(userId)) {
      throw new BadRequestException('You already have premium access.');
    }

    const customer = await this.ensureCustomer(userId);
    const base = this.frontendBaseUrl();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, plan: 'pro' },
      subscription_data: { metadata: { userId, plan: 'pro' } },
      success_url: `${base}/plans?status=success`,
      cancel_url: `${base}/plans?status=cancelled`,
    });

    return { url: session.url };
  }

  /** One-time lifetime access checkout. */
  async createLifetimeCheckout(userId: string) {
    const priceId = this.config.get<string>('stripe.lifetimePriceId');
    if (!priceId) {
      throw new BadRequestException('Lifetime plan price is not configured.');
    }
    if (await this.hasPremiumAccess(userId)) {
      throw new BadRequestException('You already have premium access.');
    }

    const customer = await this.ensureCustomer(userId);
    const base = this.frontendBaseUrl();

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, plan: 'lifetime' },
      payment_intent_data: { metadata: { userId, plan: 'lifetime' } },
      success_url: `${base}/plans?status=success`,
      cancel_url: `${base}/plans?status=cancelled`,
    });

    await this.purchaseModel.create({
      userId,
      kind: 'lifetime',
      amount: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? 'usd').toUpperCase(),
      paymentProvider: 'stripe',
      stripeCheckoutSessionId: session.id,
      status: 'pending',
    });

    return { url: session.url };
  }

  /** Stripe billing portal for managing / cancelling a subscription. */
  async createPortalSession(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.stripeCustomerId) {
      throw new BadRequestException('No billing account yet.');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.frontendBaseUrl()}/plans`,
    });
    return { url: session.url };
  }

  /** Verifies and processes a Stripe webhook. `payload` is the raw request body. */
  async handleWebhook(payload: Buffer, signature: string) {
    const secret = this.config.get<string>('stripe.webhookSecret');
    if (!secret) {
      throw new BadRequestException('Stripe webhook secret is not configured.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      this.logger.warn(
        `Stripe webhook signature verification failed: ${(err as Error).message}`,
      );
      throw new BadRequestException('Invalid webhook signature.');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          await this.fulfillLifetime(session);
        } else if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await this.stripe.subscriptions.retrieve(subId);
          await this.applySubscription(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await this.applySubscription(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const user = await this.usersService.findByStripeCustomerId(
          typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        );
        if (user) await this.usersService.downgradeToFree(String(user._id));
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        await this.purchaseModel.updateOne(
          { stripeCheckoutSessionId: session.id, status: 'pending' },
          { status: 'failed' },
        );
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private async resolveUserId(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
    metadataUserId?: string,
  ): Promise<string | null> {
    if (metadataUserId) return metadataUserId;
    if (!customer) return null;
    const customerId = typeof customer === 'string' ? customer : customer.id;
    const user = await this.usersService.findByStripeCustomerId(customerId);
    return user ? String(user._id) : null;
  }

  private async applySubscription(sub: Stripe.Subscription) {
    const userId = await this.resolveUserId(sub.customer, sub.metadata?.userId);
    if (!userId) {
      this.logger.error(`Cannot map subscription ${sub.id} to a user`);
      return;
    }

    const active = sub.status === 'active' || sub.status === 'trialing';
    const periodEnd = (sub as unknown as { current_period_end?: number })
      .current_period_end;

    await this.usersService.applySubscription(userId, {
      tier: active ? 'pro' : 'free',
      status: sub.status,
      expiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
      stripeSubscriptionId: sub.id,
    });
    this.logger.log(`Subscription ${sub.id} → user ${userId} (${sub.status})`);
  }

  private async fulfillLifetime(session: Stripe.Checkout.Session) {
    if (session.metadata?.plan !== 'lifetime') return;
    const userId = await this.resolveUserId(
      session.customer,
      session.metadata?.userId,
    );
    if (!userId) {
      this.logger.error(`Cannot map lifetime session ${session.id} to a user`);
      return;
    }

    const purchase = await this.purchaseModel.findOne({
      stripeCheckoutSessionId: session.id,
    });
    if (purchase?.status === 'completed') return; // idempotent

    await this.usersService.grantLifetime(userId);

    if (purchase) {
      purchase.status = 'completed';
      purchase.completedAt = new Date();
      purchase.amount = (session.amount_total ?? 0) / 100;
      purchase.stripePaymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : '';
      await purchase.save();
    }
    this.logger.log(`Lifetime access granted to user ${userId}`);
  }

  async findMyPurchases(userId: string) {
    return this.purchaseModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}
