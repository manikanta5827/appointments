

export const formatUser = (userData) => {
    return {
        username:userData.username,
        email:userData.email,
        profilePic:userData.profilePic,
        role: userData.role
    }
}