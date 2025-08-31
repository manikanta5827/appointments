import { verifyAuthToken } from "../service/authTokenService.js";

const authHandler = (req,res,next) => {
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
    req.userId = response.data.id;
    next();
}

export default authHandler;