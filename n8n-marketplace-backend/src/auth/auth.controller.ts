import { Controller, Post, Body, UseGuards, Get, Req, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service'; // Added this import

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService, // Added this line
    private configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() req: any) {
    // Ideally use LocalAuthGuard but for simplicity/JSON body:
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any) {
    // Guard initiates redirect
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.usersService.verifyEmail(token);
    if (!user) {
      return { message: 'Invalid or expired token' };
    }
    return { message: 'Email verified successfully' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const { access_token, refresh_token } = await this.authService.googleLogin(req.user);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    // Redirect to frontend with tokens
    res.redirect(`${frontendUrl}/auth/callback?token=${access_token}&refreshToken=${refresh_token}`);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubAuth(@Req() req: any) {
    // Guard initiates redirect
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthRedirect(@Req() req: any, @Res() res: any) {
    const { access_token, refresh_token } = await this.authService.githubLogin(req.user);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    // Redirect to frontend with tokens
    res.redirect(`${frontendUrl}/auth/callback?token=${access_token}&refreshToken=${refresh_token}`);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Req() req: any) {
    console.log('Resending verification email for user:', req.user.userId);
    return this.authService.resendVerificationEmail(req.user.userId);
  }
}
