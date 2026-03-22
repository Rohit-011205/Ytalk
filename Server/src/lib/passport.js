import passport from 'passport';
import User from '../Models/user.model.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cloudinary from './cloudinary.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
},
    async (accessToken, refreshToken, profile, done) => {
        try {

            let user = await User.findOne({
                email: profile.emails[0].value
            })

            if (user) {
                return done(null, user)
            }

            let profilePicUrl = "";
            try {
                if (profile.photos[0]?.value) {
                    const upload = await cloudinary.uploader.upload(profile.photos[0].value);
                    profilePicUrl = upload.secure_url;
                }
            } catch (uploadError) {
                console.log("Could not upload Google photo:", uploadError.message);
                profilePicUrl = ""; 
            }

            user = new User({
                googleId: profile.id,
                Fullname: profile.displayName || "Google User",
                email: profile.emails[0].value,
                profilePic: profilePicUrl,
                password: "google_oauth_password",
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken || null,
                isVerified: true,
                isOnboarded: false,
            })

            await user.save()
            return done(null, user)
        } catch (error) {
            return done(error, null)
        }
    }
))

export default passport;