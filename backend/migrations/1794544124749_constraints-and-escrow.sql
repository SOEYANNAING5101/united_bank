-- Up Migration
UPDATE accounts SET balance = 0 WHERE balance IS NULL;
ALTER TABLE accounts
    ALTER COLUMN balance SET NOT NULL,
    ADD CONSTRAINT balance_not_negative CHECK (balance >=0),
    ADD CONSTRAINT account_number_unique UNIQUE(account_number);
    
ALTER TABLE accounts ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE transactions ALTER column updated_at TYPE TIMESTAMPTZ;
ALTER TABLE users ALTER column created_at TYPE TIMESTAMPTZ;
ALTER TABLE user_profiles ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE idempotency_keys ALTER COLUMN created_at TYPE TIMESTAMPTZ;

ALTER TABLE transactions
    ADD COLUMN transfer_id UUID,
    ADD COLUMN stripe_ref VARCHAR(255) UNIQUE;
CREATE INDEX transactions_account_time ON transactions (ACCOUNT_ID, created_at DESC);
    
ALTER TABLE idempotency_keys DROP CONSTRAINT idempotency_keys_key_value_key;

ALTER TABLE idempotency_keys
    ADD COLUMN state VARCHAR(12) NOT NULL DEFAULT'DONE',
    ADD COLUMN request_hash VARCHAR(64),
    ADD CONSTRAINT idem_user_key UNIQUE(user_id,key_value);

ALTER TABLE users ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'USER';

INSERT INTO users (clerk_user_id,username,email,role)
VALUES ('system','escrow','escrow@system.local','SYSTEM');

INSERT INTO accounts (user_id,account_number,account_type,balance)
SELECT user_id,'0000000000', 'escrow', 0 FROM users WHERE clerk_user_id = 'system';
-- Down Migration
DELETE FROM accounts WHERE account_number = '0000000000';
DELETE FROM users WHERE clerk_user_id='system';
ALTER TABLE users DROP COLUMN 'role';

ALTER TABLE idempotency_keys DROP CONSTRAINT idem_user_key;
ALTER TABLE idempotency_keys DROP COLUMN request_hash, DROP COLUMN state;
ALTER TABLE idempotency_keys ADD CONSTRAINT idempotency_keys_key_value_key UNIQUE (key_value);

DROP INDEX IF EXISTS transactions_account_time;
ALTER TABLE transactions DROP COLUMN stripe_ref, DROP COLUMN transfer_id;

ALTER TABLE idempotency_keys ALTER COLUMN created_at TYPE TIMESTAMP;
ALTER TABLE user_profiles    ALTER COLUMN created_at TYPE TIMESTAMP, ALTER COLUMN updated_at TYPE TIMESTAMP;
ALTER TABLE users            ALTER COLUMN created_at TYPE TIMESTAMP;
ALTER TABLE transactions     ALTER COLUMN updated_at TYPE TIMESTAMP;
ALTER TABLE accounts         ALTER COLUMN created_at TYPE TIMESTAMP, ALTER COLUMN updated_at TYPE TIMESTAMP;

ALTER TABLE accounts
  DROP CONSTRAINT account_number_unique,
  DROP CONSTRAINT balance_not_negative,
  ALTER COLUMN balance DROP NOT NULL;