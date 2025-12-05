import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user.toObject();
      if (user.isBlocked) {
        return null;
      }
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user._id, 
      roles: user.roles || ['user'],
      isCreator: user.isCreator,
      emailVerified: user.emailVerified
    };

    if (user.isBlocked) {
      throw new UnauthorizedException('Your account has been blocked. Please contact support.');
    }

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // Should use config
    };
  }

  async register(registerDto: any) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
      verificationToken,
    });
    
    await this.mailService.sendVerificationEmail(newUser.email, verificationToken);
    
    return this.login(newUser);
  }

  async googleLogin(googleUser: any) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);
    if (!user) {
      // Check by email to link
      user = await this.usersService.findByEmail(googleUser.email);
      if (user) {
        user = await this.usersService.linkGoogleAccount(user._id.toString(), googleUser.googleId);
      } else {
        user = await this.usersService.createFromGoogle(googleUser);
      }
    }
    return this.login(user);
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.updateVerificationToken(userId, verificationToken);
    await this.mailService.sendVerificationEmail(user.email, verificationToken);
    
    return { message: 'Verification email sent' };
  }
}
