const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString : process.env.database_url,
})

pool.connect((err)=>{
    if(err){
        console.error("Connection error: ",err.stack);
    }else{
        console.log("Connected to Neon PostgreSQL Vault")
    }
})

module.exports = pool;