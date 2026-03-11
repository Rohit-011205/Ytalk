import express from "express";
import { signup, login, logout, completeOnboarding } from "../Controllers/auth.controller.js"
import { updateProfile } from "../Controllers/auth.controller.js";
import { protectRoute } from "../Middlewares/auth.middleware.js";
import { checkAuth } from "../Controllers/auth.controller.js";
import passport from "../lib/passport.js";
import { generateToken } from "../lib/utils.js";
// import { session } from "passport";


const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/updateprofile", protectRoute, updateProfile)

router.get("/check", protectRoute, checkAuth)

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}))

router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
}),
    (req, res) => {
        generateToken(req.user._id, res);

        if (!req.user.isOnboarded) {
            return res.redirect(`${process.env.CLIENT_URL}/onboarding`);
        }

        // res.redirect(`${process.env.CLIENT_URL}/auth/google/success`)
        res.redirect(`${process.env.CLIENT_URL}/`);
    })

router.post("/complete-onboarding", protectRoute,completeOnboarding)

export default router;
