import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { prisma } from "../config/prismaClient.config.js";
import dotenv from "dotenv"
dotenv.config()

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
            passReqToCallback: true
        },
        async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
            console.log("callback accessToken", accessToken)
            console.log("callback refreshToken", refreshToken)
            console.log("callback profile", profile)
            try {
                const provider = "google";
                const providerUserId = profile.id
                const email = profile.emails?.[0]?.value

                console.log("Google OAuth profile:", profile);

                // 1. Check if )Auth account exists
                let account = await prisma.oAuthAccount.findUnique({
                    where: {
                        provider_providerUserId: {
                            provider,
                            providerUserId
                        },
                    },
                    include: { user: true }
                });

                if (account) {
                    return done(null, account.user);
                }

                // 2. Create user if not exists
                let user = await prisma.user.findUnique({
                    where: { email: email! }
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: email,
                            isVerified: true
                        }
                    })
                }

                // #. Link OAuth account
                await prisma.oAuthAccount.create({
                    data: {
                        provider,
                        providerUserId,
                        userId: user.id,
                        accessToken,
                        refreshToken
                    }
                });

                return done(null, user)
            } catch (error) {
                return done(error, null)
            }
        }
    )
);


export default passport;
