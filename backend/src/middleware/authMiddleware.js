const jwt = require('jsonwebtoken')

const verifyToken = (req,res,next) =>{
    const authHeader  = req.headers['authorization'];
    if (!authHeader){
        return res.status(403).json({message:"Access denied:No token provided"})
    }
    let token;
    if(authHeader.startsWith('Bearer ')){
        token = authHeader.split(' ')[1]
    }else{
        token = authHeader;
    }
    if (!token){
        return res.status(403).json({message:"Access denied:Token corrupted"})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user_id = decoded.user_id
        next();

    }catch(error){
        return res.status(500).json({message:"Invalid or expired token"})
    }
};
module.exports = verifyToken