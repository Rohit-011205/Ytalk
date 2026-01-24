import express from "express";
import {signup,login,logout} from "../Controllers/auth.controller.js"
import { updateProfile } from "../Controllers/auth.controller.js";
import {protectRoute}  from "../Middlewares/auth.middleware.js";
import { checkAuth } from "../Controllers/auth.controller.js";


const router = express.Router();

router.post("/signup",signup);

router.post("/login", login);

router.post("/logout",logout);

router.put("/updateprofile",protectRoute,updateProfile)

router.get("/check",protectRoute,checkAuth)

export default router;
