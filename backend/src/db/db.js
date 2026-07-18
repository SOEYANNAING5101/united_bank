const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString : process.env.DATABASE_URL,
})
pool.on('error',(err,client) =>{
    console.error("Neon suspended compute (idle timeout): ",err.message)
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