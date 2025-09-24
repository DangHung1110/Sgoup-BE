import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from "passport-facebook";
import { AuthService } from "../modules/auth/auth.service.js";
import { User } from "../entities/user.entities.js";

dotenv.config();

const authService = new AuthService();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? "";

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID ?? "";
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET ?? "";
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL ?? "";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const foundUser = await (User as any).findOne({ "providers.google.id": profile.id });
        if (!foundUser) {
          const newUser = new (User as any)({
            fullname: profile.displayName ?? profile._json?.name ?? "",
            username: profile._json?.email ?? "",
            email: profile._json?.email ?? "",
            password: "",
            loginMethod: "google",
            providers: {
              google: {
                id: profile.id,
                email: profile._json?.email,
              },
            },
          });
          await newUser.save();
          return done(null, newUser);
        }
        return done(null, foundUser);
      } catch (err) {
        return done(err as any);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails", "name"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: FacebookProfile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const foundUser = await (User as any).findOne({ "providers.facebook.id": profile.id });
        if (!foundUser) {
          const newUser = new (User as any)({
            fullname: profile.displayName ?? profile._json?.name ?? "",
            username: profile._json?.email ?? "",
            email: profile._json?.email ?? "",
            password: "",
            loginMethod: "facebook",
            providers: {
              facebook: {
                id: profile.id,
                email: profile._json?.email,
              },
            },
          });
          await newUser.save();
          return done(null, newUser);
        }
        return done(null, foundUser);
      } catch (err) {
        return done(err as any);
      }
    }
  )
);

passport.serializeUser((user: any, done: (error: any, user?: any) => void) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: (error: any, user?: any) => void) => {
  done(null, user);
});

export default passport;