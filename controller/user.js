import User from "../models/user.js";
import crypto from "crypto";
import { uploadMedia, deleteMedia } from "../utils/cloudinary.js";
import { sendToken } from "../utils/sendToken.js";
import sendEmail from "../utils/sendEmail.js";

export const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            country,
            role,
        } = req.body;
        const adminCount = await User.countDocuments({ role: "Admin" });

        if (adminCount >= 2) {
            return res.status(400).json({
                success: false,
                message: "Only 2 admin accounts are allowed.",
            });
        }

        const alreadyUser = await User.findOne({ email });

        if (alreadyUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        let imageData = null;

        if (req.file) {
            const result = await uploadMedia(req.file.buffer, "image");

            imageData = {
                url: result.url,
                public_id: result.public_id,
            };
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            country,
            role: "Admin",
            image: imageData,
        });

        return res.status(201).json({
            success: true,
            message: "Admin created successfully.",
            user,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return sendToken(user, 200, res);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", null, {
            expires: new Date(0),
            httpOnly: true,
        }).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.country = req.body.country || user.country;

        if (req.file) {
            if (user.image?.public_id) {
                await deleteMedia(user.image.public_id);
            }

            const result = await uploadMedia(req.file.buffer, "image");

            user.image = {
                url: result.url,
                public_id: result.public_id,
            };
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        user.password = newPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const resetToken = user.getResetPasswordToken();

        await user.save({
            validateBeforeSave: false,
        });

        const resetUrl = `https://softrisehub.com/reset-password/${resetToken}`;

        await sendEmail({
            mail: process.env.Mail,
            pass: process.env.Pass,
            email: user.email,
            subject: "Password Reset Link",
            text: `You requested a password reset.\n\nYour link:\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
        });

        return res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select("+password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        const { newPassword, confirmNewPassword } = req.body;

        if (!newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Both fields are required",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const addImage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
            });
        }

        if (user.image?.public_id) {
            await deleteMedia(user.image.public_id);
        }

        const result = await uploadMedia(req.file.buffer, "image");

        user.image = {
            url: result.url,
            public_id: result.public_id,
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};