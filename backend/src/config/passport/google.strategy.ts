import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import logger from "../winston";
import config from "../config.env";
import { prisma } from "../database";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_REDIRECT_URL,
    },
    async (_accessToken, _refreshToken, profile: Profile, done: VerifyCallback) => {
      try {
        logger.info("Google OAuth Attempt", {
          provderId: profile.id,
          displayName: profile.displayName,
        });

        const email = profile.emails?.[0].value;

        if (!email) {
          logger.warn("Google OAuth failed: No email found", {
            provderId: profile.id,
          });
          return done(new Error("Email not found"), undefined);
        }

        // check if user exist
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          logger.info("Creating new Google user", {
            email,
            provderId: profile.id,
          });

          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              role: "User",
              provider: "GOOGLE",
              providerId: profile.id,
              isVerified: true,
            },
          });

          logger.info("New Google user created", {
            userId: user.id,
            email,
          });
        } else {
          logger.warn("Existing user logged in via Google", {
            userId: user.id,
            email,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);
