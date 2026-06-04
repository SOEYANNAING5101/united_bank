const pool = require('../db/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//New user Registration
const userRegister = async (req,res) =>{
    try{
        const {username,email,password} = req.body
        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required"})
        }
        console.log(username,email,password)
        const saltRound = 10 
        const password_hash = await bcrypt.hash(password,saltRound)

        const newUser = await pool.query(
            `INSERT INTO users (username,email,password_hash)
            VALUES($1,$2,$3)
            RETURNING user_id,username,email,created_at`,
            [username,email,password_hash]
        );
        return res.status(200).json({
            message: "Registered new users",
            user: newUser.rows[0]
        })
    }catch(error){
        console.error("Error registering new user.",error)
    }
};
//User Log In
const userLogIn = async (req,res) =>{
    const {email,password} = req.body
    if (!email || !password){
        return res.status(400).json({message:"All fields are required"})
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1;',[email])
    if(userResult.rows.length ===0)
        return res.status(401).json({message:"Incorrect email or password"})
    
    const user = userResult.rows[0]
    //check password
    const isMatch = await bcrypt.compare(password,user.password_hash)
    if(!isMatch){
        return res.status(401).json({message:"Incorrect email or password"})   
    };
    const token = jwt.sign(
        {user_id:user.user_id,username:user.username,email:user.email},
        process.env.JWT_SECRET,
        {expiresIn:"3 days"}
    )
    return res.status(200).json({
        message:"Log in successful.",
        user_id:user.user_id,
        name:user.username,
        email:user.email,
        token:token
    })

};


module.exports ={
    userRegister,
    userLogIn
}