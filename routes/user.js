import express from "express";
import multer from "multer";
import {
    addImage,
    createUser,
    getMyProfile,
    loginUser,
    logout,
    requestPasswordReset,
    resetPassword,
    updatePassword,
    updateUser
} from "../controller/user.js";
import { isAuthenticated } from "../utils/auth.js";

const userRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

userRouter.post("/signup", upload.single("image"), createUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", isAuthenticated, logout);

userRouter.get("/me", isAuthenticated, getMyProfile);

userRouter.put("/update/:id", isAuthenticated, updateUser);
userRouter.put("/update/password", isAuthenticated, updatePassword);

userRouter.post("/password/reset/request", requestPasswordReset);
userRouter.put("/reset/password/:token", resetPassword);

userRouter.put(
    "/upload/image",
    isAuthenticated,
    upload.single("image"),
    addImage
);

export default userRouter;

/*
📌 API Endpoints

POST   http://localhost:5000/api/v1/user/signup
POST   http://localhost:5000/api/v1/user/login
POST   http://localhost:5000/api/v1/user/logout
GET    http://localhost:5000/api/v1/user/me
PUT    http://localhost:5000/api/v1/user/update/:id
PUT    http://localhost:5000/api/v1/user/update/password
POST   http://localhost:5000/api/v1/user/password/reset/request
PUT    http://localhost:5000/api/v1/user/reset/password/:token
PUT    http://localhost:5000/api/v1/user/upload/image
*/