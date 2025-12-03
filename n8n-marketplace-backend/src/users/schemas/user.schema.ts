import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  fullName: string;

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: 'local', enum: ['local', 'google'] })
  authProvider: string;

  @Prop({ unique: true, sparse: true })
  googleId: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({
    default: 'free',
    enum: ['free', 'starter', 'pro', 'business'],
  })
  subscriptionTier: string;

  @Prop({
    default: 'active',
    enum: ['active', 'canceled', 'expired', 'past_due'],
  })
  subscriptionStatus: string;

  @Prop()
  subscriptionExpiresAt: Date;

  @Prop()
  stripeCustomerId: string;

  @Prop({ default: 0 })
  totalDownloads: number;

  @Prop({ default: 0 })
  totalUploads: number;

  @Prop({ default: false })
  newsletterSubscribed: boolean;

  @Prop({ default: true })
  marketingEmails: boolean;

  @Prop({ default: false })
  isCreator: boolean;

  @Prop({ default: false })
  creatorVerified: boolean;

  @Prop()
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
