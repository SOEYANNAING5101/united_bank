const pool = require("./db");

const createTables = async () => {
  const schemeQuery = `
    DROP TABLE IF EXISTS transactions, accounts, users CASCADE;

    CREATE TABLE IF NOT EXISTS users(
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
    account_id UUID PRIMARY KEY  DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    account_number VARCHAR(200) NOT NULL,
    account_type VARCHAR(200) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    txn_limit_per_transfer DECIMAL(12,2) DEFAULT 5000.00,
    daily_transfer_limit DECIMAL(12,2) DEFAULT 10000.00,
    monthly_transfer_limit DECIMAL(12,2) DEFAULT 20000.00,
    currency VARCHAR(10) DEFAULT 'SGD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions(
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    counterparty VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50) DEFAULT 'GENERAL',
    status VARCHAR(20) DEFAULT 'COMPLETED',
    transaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS idempotency_keys(
    id SERIAL PRIMARY KEY,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    request_path VARCHAR(255) NOT NULL,
    response_body JSONB,
    response_status INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
    )

    `;
  try {
    console.log("Creating new database tables");
    await pool.query(schemeQuery);
  } catch (error) {
    console.error("Error creating tables: ", error.message);
  } finally {
    pool.end();
  }
};

createTables();
