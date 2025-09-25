import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from "passport-facebook";
import { AuthService } from "../modules/auth/auth.service";
import { authRepository } from "../modules/auth/auth.respository";

dotenv.config();

const authService = new AuthService();
const repo = new authRepository();

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
        const email = (profile._json as any)?.email ?? "";
        if (!email) return done(new Error("Google profile missing email"));

        const existing = await repo.findByEmail(email);
        if (existing) return done(null, existing);

        const created = await repo.createUser({
          name: profile.displayName ?? (profile._json as any)?.name ?? "",
          email,
          password: "",
          role: "user",
        });
        return done(null, created);
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
        const email = (profile._json as any)?.email ?? "";
        if (!email) return done(new Error("Facebook profile missing email"));

        const existing = await repo.findByEmail(email);
        if (existing) return done(null, existing);

        const created = await repo.createUser({
          name: profile.displayName ?? (profile._json as any)?.name ?? "",
          email,
          password: "",
          role: "user",
        });
        return done(null, created);
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