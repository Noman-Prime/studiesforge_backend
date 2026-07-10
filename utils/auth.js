import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User is not logged in",
            });
        }

        const decodedData = jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        const user = await User.findById(decodedData.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};


export const isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this resource",
            });
        }

        next();
    };
};