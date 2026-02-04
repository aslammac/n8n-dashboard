import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('app.github.clientId') || '',
      clientSecret: configService.get<string>('app.github.clientSecret') || '',
      callbackURL: configService.get<string>('app.github.callbackUrl') || '',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { username, displayName, emails, photos, id } = profile;
    
    // GitHub profile photos are in the photos array
    const avatarUrl = photos?.[0]?.value || '';
    
    const user = {
      email: emails?.[0]?.value,
      fullName: displayName || username,
      avatarUrl,
      githubId: id,
      username,
      accessToken,
    };
    done(null, user);
  }
}
