const pool = require ('../db/db')

const requireKyc = async (req,res,next) =>{
    try {
    const clerk_user_id = req.auth.userId;
    const { rows } = await pool.query(
        `SELECT u.user_id, p.profile_id
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE u.clerk_user_id = $1`,
        [clerk_user_id]
    );

    if (rows.length === 0){
        return res.status(404).json({message: "User not found in system"})
    }
    const {user_id, profile_id} = rows[0]
    if (!profile_id){
        return res.status(403).status({
            code : "Profile Required",
            message : "You must complete your financial profile to access this feature."
        })
    }
    req.internal_user_id = user_id;
    next()
    }catch(error){
        console.error("Kyc middleware error: ",error.message)
        return res.status(500).json({message:"Server error verifying user permission."})
    }

}
module.exports = {requireKyc}