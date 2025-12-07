import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('app.google.clientId') || 'fallbackId',
      clientSecret: configService.get<string>('app.google.clientSecret') || 'fallbackSecret',
      callbackURL: configService.get<string>('app.google.callbackUrl') || 'fallbackUrl',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    
    let newsletter = false;
    if (req.query.state) {
      try {
        const state = JSON.parse(req.query.state);
        newsletter = state.newsletter === 'true';
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    const user = {
      email: emails[0].value,
      fullName: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      googleId: id,
      accessToken,
      newsletterSubscribed: newsletter,
    };
    done(null, user);
  }
}
