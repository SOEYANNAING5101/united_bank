-- Up Migration
UPDATE transactions SET transaction_type = 'PEER_TRANSFER' WHERE transaction_type = 'PEER';
UPDATE transactions SET transaction_type = 'INTERNAL_TRANSFER' WHERE transaction_type = 'INTERNAL TRANSFER';
ALTER TABLE transactions 
    ADD COLUMN direction VARCHAR(3)
        GENERATED ALWAYS AS (CASE WHEN amount<0 THEN 'OUT' ELSE 'IN' END)STORED,
    ADD CONSTRAINT amount_not_zero CHECK (amount<>0),
    ADD CONSTRAINT transaction_type_valid CHECK (transaction_type IN(
        'EXTERNAL_DEPOSIT','EXTERNAL_WITHDRAWAL','INTERNAL_TRANSFER','PEER_TRANSFER','DEAL_HOLD','DEAL_RELEASE','DEAL_REFUND'
    )),
    ADD CONSTRAINT transaction_status_valid CHECK (status IN ('PENDING','COMPLETED','FAILED'));
    
-- Down Migration
ALTER TABLE transactions
  DROP CONSTRAINT transaction_status_valid,
  DROP CONSTRAINT transaction_type_valid,
  DROP CONSTRAINT amount_not_zero,
  DROP COLUMN direction; 