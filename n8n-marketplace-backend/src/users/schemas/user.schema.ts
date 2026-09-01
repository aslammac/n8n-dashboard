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

  @Prop({ default: 'local', enum: ['local', 'google', 'github'] })
  authProvider: string;

  @Prop({ type: [String], default: ['user'], enum: ['user', 'admin'] })
  roles: string[];

  @Prop({ unique: true, sparse: true })
  googleId: string;

  @Prop({ unique: true, sparse: true })
  githubId: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ select: false, type: String })
  verificationToken: string | null;

  @Prop({
    default: 'free',
    enum: ['free', 'starter', 'pro', 'business', 'lifetime'],
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

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
