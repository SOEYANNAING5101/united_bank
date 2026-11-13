
const {getAuth,clerkClient} = require('@clerk/express')
const pool  = require('../db/db');
async function loadUser(req,res,next){
    // Check clerk user id 
    const {userId} = getAuth(req);
    if(!userId) return res.status(401).json({message:"Please sign in"})
    let {rows} =await pool.query(
        `SELECT u.user_id,u.role,p.profile_id 
        FROM users u LEFT JOIN user_profiles p ON p.user_id =u.user_id
        WHERE u.clerk_user_id = $1`,[userId]
    );
    if (rows.length === 0){
        const cu = await clerkClient.users.getUser(userId)
        const email = cu.emailAddresses[0]?.emailAddress;
        const username = cu.username || `user_${userId.slice(-8)}`;
        ({rows} = await pool.query(
            `INSERT INTO users (clerk_user_id,username,email) VALUES ($1,$2,$3)
            ON CONFLICT (clerk_user_id) DO UPDATE set email = EXCLUDED.email
            RETURNING user_id,role, NULL ::uuid as profile_id
            `,[userId,username,email]
        ))
    }
    req.user = {id:rows[0].user_id,clerkId:userId,role:rows[0].role,hasProfile:!!rows[0].profile_id};
    req.internal_user_id = rows[0].user_id
    next()
} 
const requireProfile = (req,res,next)=>
    req.user.hasProfile ? next()
    :res.status(403).json({code:'PROFILE_REQUIRED',message:"Complete your profile to use this feature."})

const requireAdmin = (req,res,next) =>
    req.user.role === 'ADMIN'?next(): res.status(403).json({message:"Not allowed"});
module.exports = {loadUser,requireProfile,requireAdmin}