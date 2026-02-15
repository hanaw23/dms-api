import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtConfig.user_secret as string,
    });
  }

  validate(payload: any) {
    return {
      sub: payload.sub,
      id: payload.sub,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    };
  }
}
