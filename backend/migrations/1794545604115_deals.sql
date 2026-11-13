-- Up Migration
CREATE TABLE deals(
    deal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(user_id),
    buyer_id UUID NOT NULL REFERENCES users(user_id),
    seller_account_id UUID NOT NULL REFERENCES accounts(account_id),
    buyer_account_id UUID REFERENCES accounts(account_id),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    amount NUMERIC(12,2) NOT NULL CHECK (amount>0 and amount<=2000),
    delivery_type VARCHAR(10) NOT NULL CHECK (delivery_type IN ('POST','MEETUP')),
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED'
        CHECK (status IN ('CREATED','FUNDED','SHIPPED','DELIVERED','DISPUTED','RELEASED','REFUNDED','CANCELLED','EXPIRED')),
    cancel_requested BOOLEAN NOT NULL DEFAULT false,
    tracking_number VARCHAR(100),
    pay_by TIMESTAMPTZ,
    ship_by TIMESTAMPTZ,
    deliver_by TIMESTAMPTZ,
    auto_release_at TIMESTAMPTZ,
    dispute_reason VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (seller_id <> buyer_id)
);
CREATE INDEX deals_status_release ON deals (status, auto_release_at);
CREATE INDEX deals_buyer  ON deals (buyer_id);
CREATE INDEX deals_seller ON deals (seller_id);

ALTER TABLE transactions ADD COLUMN deal_id UUID REFERENCES deals(deal_id);

CREATE TABLE deal_events (
    event_id BIGSERIAL PRIMARY KEY,
    deal_id UUID NOT NULL REFERENCES deals(deal_id),
    actor VARCHAR(10) NOT NULL CHECK (actor IN ('BUYER','SELLER','SYSTEM','ADMIN')),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX deal_events_deal ON deal_events(deal_id,created_at);

-- Down Migration
ALTER TABLE transactions DROP COLUMN deal_id;
DROP TABLE deal_events;
DROP TABLE deals;
