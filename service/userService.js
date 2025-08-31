

export const formatUserResponse = (userData) => {
    return {
        username:userData.username,
        email:userData.email,
        profilePic:userData.profilePic,
        userType: userData.userType,
        emailVerified:userData.emailVerified,
        lastLogin:userData.lastLogin
    }
}