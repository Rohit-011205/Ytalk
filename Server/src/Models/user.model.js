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
    
},
{timestamps: true}
)

const User = mongoose.model("User", userSchema);

export default User;