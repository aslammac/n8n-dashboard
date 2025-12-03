import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
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

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const { access_token, refresh_token } = await this.authService.googleLogin(req.user);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    // Redirect to frontend with tokens
    res.redirect(`${frontendUrl}/auth/callback?token=${access_token}&refreshToken=${refresh_token}`);
  }
}
