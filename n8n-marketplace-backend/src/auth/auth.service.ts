import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.isCreator ? 'creator' : 'user' };
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
    const newUser = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });
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
}
