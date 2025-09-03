import { verifyAuthToken } from "../service/authService.js";
import { findUserById } from "../repository/userRepository.js";

const authHandler = async(req,res,next) => {
    const authToken = req.headers['auth-token'];

    if(!authToken) {
        return res.status(400).json({
            status: "error",
            message: "Auth token required"
        })
    }

    // validate the auth token
    const response = verifyAuthToken(authToken);
    if(!response.status) {
        return res.status(401).json({
            status: "error",
            message: response.data || "Invalid Token"
        })
    }

    // keep the user data in req body
    const user = await findUserById(response.data.id);

    if(!user) {
        return res.status(404).json({
            status: "error",
            message: "user not found"
        })
    }
    req.user = user;
    next();
}

export default authHandler;