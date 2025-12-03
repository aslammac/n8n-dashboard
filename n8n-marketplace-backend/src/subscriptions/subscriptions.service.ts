import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {}

  async findByUserId(userId: string): Promise<SubscriptionDocument | null> {
    return this.subscriptionModel.findOne({ userId }).exec();
  }

  // Placeholder for Stripe integration
  async createCheckoutSession(userId: string, priceId: string) {
    return { url: 'https://checkout.stripe.com/...' };
  }
}
