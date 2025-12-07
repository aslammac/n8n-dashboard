import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // No error is thrown if no user is found
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      return null;
    }
    return user;
  }
}
