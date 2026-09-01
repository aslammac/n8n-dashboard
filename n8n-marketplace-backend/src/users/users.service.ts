import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: any): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-passwordHash -newsletterSubscribed -marketingEmails -totalDownloads -totalUploads').exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ githubId }).exec();
  }

  async createFromGoogle(googleData: any): Promise<UserDocument> {
    const newUser = new this.userModel({
      email: googleData.email,
      fullName: googleData.fullName,
      avatarUrl: googleData.picture,
      googleId: googleData.googleId,
      authProvider: 'google',
      emailVerified: true,
      username: googleData.email.split('@')[0] + Math.floor(Math.random() * 10000), // temp username
      newsletterSubscribed: googleData.newsletterSubscribed || false,
    });
    return newUser.save();
  }

  async createFromGithub(githubData: any): Promise<UserDocument> {
    const newUser = new this.userModel({
      email: githubData.email,
      fullName: githubData.fullName,
      avatarUrl: githubData.avatarUrl,
      githubId: githubData.githubId,
      authProvider: 'github',
      emailVerified: true,
      username: githubData.username || (githubData.email ? githubData.email.split('@')[0] : 'user') + Math.floor(Math.random() * 10000),
      newsletterSubscribed: githubData.newsletterSubscribed || false,
    });
    return newUser.save();
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        googleId,
        authProvider: 'google',
        emailVerified: true,
      },
      { new: true },
    );
  }

  async linkGithubAccount(userId: string, githubId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        githubId,
        authProvider: 'github',
        emailVerified: true,
      },
      { new: true },
    );
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }

  async setStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { stripeCustomerId });
  }

  findByStripeCustomerId(stripeCustomerId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ stripeCustomerId }).exec();
  }

  async applySubscription(
    userId: string,
    data: {
      tier: string;
      status: string;
      expiresAt?: Date | null;
      stripeSubscriptionId?: string;
    },
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      subscriptionTier: data.tier,
      subscriptionStatus: data.status,
      subscriptionExpiresAt: data.expiresAt ?? null,
    });
  }

  async grantLifetime(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      subscriptionTier: 'lifetime',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: null,
    });
  }

  async downgradeToFree(userId: string): Promise<void> {
    // Never downgrade someone who bought lifetime access.
    await this.userModel.updateOne(
      { _id: userId, subscriptionTier: { $ne: 'lifetime' } },
      { subscriptionTier: 'free', subscriptionStatus: 'canceled' },
    );
  }

  async verifyEmail(token: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ verificationToken: token }).exec();
    if (user) {
      user.emailVerified = true;
      user.verificationToken = null;
      await user.save();
    }
    return user;
  }

  async findAll(search?: string): Promise<UserDocument[]> {
    const filter: any = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { username: regex }
      ];
    }
    return this.userModel.find(filter).select('-passwordHash').exec();
  }

  async updateRole(userId: string, role: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, { $addToSet: { roles: role } }, { new: true }).exec();
  }

  async removeRole(userId: string, role: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, { $pull: { roles: role } }, { new: true }).exec();
  }

  async updateVerificationToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { verificationToken: token }).exec();
  }

  async blockUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, { isBlocked: true }, { new: true }).exec();
  }

  async unblockUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, { isBlocked: false }, { new: true }).exec();
  }
}
