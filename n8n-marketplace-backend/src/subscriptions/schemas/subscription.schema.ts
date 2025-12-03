import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: User;

  @Prop({ enum: ['starter', 'pro', 'business'], required: true })
  tier: string;

  @Prop({ enum: ['active', 'canceled', 'past_due', 'expired'], default: 'active' })
  status: string;

  @Prop({ unique: true })
  stripeSubscriptionId: string;

  @Prop()
  stripeCustomerId: string;

  @Prop()
  stripePriceId: string;

  @Prop()
  currentPeriodStart: Date;

  @Prop()
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop()
  amount: number;

  @Prop()
  currency: string;

  @Prop({ enum: ['month', 'year'] })
  interval: string;

  @Prop()
  canceledAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
