export const sendToken = (user, statusCode, res) => {
    const token = user.jsonWebToken()
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }
    return res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    })
}