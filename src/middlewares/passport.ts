import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import UsersService from '../services/users/users.service';
import { JWT_SECRET } from './jwt';

passport.use('login-strategy',
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      try {
        const user = await UsersService.findByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        const valid = await UsersService.verifyPassword(user, password);
        if (!valid) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET as string,
    },
    async (jwtPayload: any, done: any) => {
      try {
        const user = await UsersService.findById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;