const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString : process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized : false
    }
})
pool.on('error',(err,client) =>{
    console.error("Unexpected error on idle client: ",err)
})

pool.connect((err,client,release)=>{
    if(err){
        console.error("Connection error: ",err.stack);
    }else{
        console.log("Connected to Neon PostgreSQL Vault")
        release();
    }
});

module.exports = pool;