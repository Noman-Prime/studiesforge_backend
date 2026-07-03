import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Minimum 8 chracters"],
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: "Admin",
        default: "Admin"
    },
    country: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true,
        
    },
    image : {
        url:{
            type: String,
        },
        public_id :{
            type: String
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return
})

userSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password)
}

userSchema.methods.jsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY, { expiresIn: "7d" })
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000
    return resetToken
}

const User = mongoose.model("Users", userSchema)
export default User