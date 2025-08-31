

export const formatUserResponse = (userData) => {
    return {
        username:userData.username,
        email:userData.email,
        profilePic:userData.profilePic,
        role: userData.role,
        emailVerified:userData.emailVerified,
        lastLogin:userData.lastLogin
    }
}