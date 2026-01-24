import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
// import React from "../assets/react.svg";


export const signup = async (req, res) => {
    const { Fullname, email, password } = req.body
    console.log("SIGNUP HIT", req.body);



    try {
        if (!Fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const user = await User.findOne({ email })

        if (user) return res.status(400).json({ message: "Email already exist" })

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            Fullname: Fullname,
            email: email,
            password: hashedPassword,
            profilePic: "",
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                Fullname: newUser.Fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })
        }
        else {
            res.status(400).json({ message: "Ivalid User data" })
        }




    } catch (error) {
        console.log("Error in Signup Controller:", error.message)

        res.status(500).json({ message: "Internal server problem" })
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user.id,
            email: user.email,
            profilePic: user.profilePic,
        })

    } catch (error) {
        console.log("error in login controller", error.message)
        res.status(500).json({ message: "Internal server problem" })
    }

};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })

            +
            res.status(200).json({ message: "Logged Out Successfully" })
    } catch (error) {
        console.log("error in logout controller", error.message)
        res.status(500).json({ message: "Internal server problem" })
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, Fullname } = req.body;
        const userId = req.user._id;

        // Create an object to hold only the fields we want to update
        const updateFields = {};

        // 1. Handle Fullname update
        if (Fullname) {
            updateFields.Fullname = Fullname;
        }

        // 2. Handle Profile Picture update
        if (profilePic) {
            // Only upload to Cloudinary if profilePic is provided in the request
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateFields.profilePic = uploadResponse.secure_url;
        }

        // 3. Update the user with the dynamic 'updateFields' object
        // We use $set to ensure we only change the fields provided
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This name is already taken (Unique Constraint Error)" });
        }
        console.log("Error in Update controller:", error.message);
        res.status(500).json({ message: "Internal server problem" });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)

    } catch (error) {
        console.log("Auth error in Controller", error.message)

        res.status(500).json({ message: "Internal server problem" })
    }
}