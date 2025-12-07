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

  async linkGoogleAccount(userId: string, googleId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        googleId,
        authProvider: 'google', // Or keep 'local' but add googleId? Usually we might want to allow both or switch.
        // Requirement says: "If email exists from email/password signup → Link Google account to existing user"
        // And "Users who signed up with Google cannot login with password"
        // So if linking, we probably just add googleId.
        emailVerified: true,
      },
      { new: true },
    );
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
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
