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
    return this.userModel.findById(id).exec();
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
}
