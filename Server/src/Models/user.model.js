import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    Fullname: {
        type: String,
        required: true,
        // unique:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique:true,
         minlength: 6,
    },
    profilePic: {
        type: String,
        default:null,
        
    },
        bio: {
        type: String,
        default: "",
        maxlength: 200,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    googleId:{
        type: String,
        default: null,
    },
    isVerified: {
        type:Boolean,
        default: false,
    },

    isOnboarded: {
        type: Boolean,
        default: false,
    },
    
},
{timestamps: true}
)

const User = mongoose.model("User", userSchema);

export default User;