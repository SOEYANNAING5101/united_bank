const pool = require("../db/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { toCents, dbToCents } = require("../utils/money");
const moveMoney = require("../services/moveMoney");
const httpError = require("../utils/httpError");
const { assertWithinLimits } = require("../services/limits");

const withdrawMoney = async (req, res) => {
  const { account_id, amount: cents, description } = req.valid.body;
  const amount = (cents / 100).toFixed(2);
  const client = await pool.connect();
  try {
    // Update account, create new transactions(with status=PENDING) in NEON database
    let account, tx;
    try {
      await client.query("BEGIN");
      ({
        rows: [account],
      } = await client.query(
        `SELECT a.account_id,a.status,a.balance,a.txn_limit_per_transfer, a.daily_transfer_limit, a.monthly_transfer_limit,u.stripe_connect_id
        FROM accounts a JOIN users u ON u.user_id = a.user_id
        WHERE a.account_id =$1 AND u.user_id =$2
        FOR UPDATE OF a
        `,
        [account_id, req.user.id],
      ));
      if (!account) throw httpError(404, "Account not found");
      if (account.status !== "ACTIVE")
        throw httpError(422, "Account not active");
      if (!account.stripe_connect_id) {
        throw httpError(
          422,
          "Please link your account before withdrawing funds",
          "LINK_BANK_REQUIRED",
        );
      }
      if (cents > dbToCents(account.balance)) {
        throw httpError(422, "Insufficient fund for this transfer.");
      }
      await assertWithinLimits(client, account, cents);
      await client.query(
        `UPDATE accounts SET balance = balance - $1,updated_at=NOW() WHERE account_id=$2`,
        [amount, account_id],
      );
      ({
        rows: [tx],
      } = await client.query(
        `INSERT INTO transactions (account_id,amount,counterparty,description,status,transaction_type)
        VALUES ($1,-$2::numeric,'Linked Bank account',$3,'PENDING','EXTERNAL_WITHDRAWAL')
        RETURNING transaction_id,description,amount,created_at`,
        [account_id, amount, description || "Withdrawal to linked bank."],
      ));
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }

    // Stripe
    let transfer;
    try {
      transfer = await stripe.transfers.create(
        {
          amount: cents,
          currency: "sgd",
          destination: account.stripe_connect_id,
          description: tx.description,
        },
        {
          idempotencyKey: `withdraw_${tx.transaction_id}`,
        },
      );
    } catch (stripeError) {
      console.error(
        "Stripe transfer failed: ",
        stripeError.type,
        stripeError.message,
      );
      const outcomeUnknown = [
        "StripeConnectionError",
        "StripeAPIError",
      ].includes(stripeError.type);
      if (outcomeUnknown) {
        return res
          .status(202)
          .json({
            message: "Your withdrawal is being processed.",
            transaction: tx,
          });
      }
      await client.query(
        `WITH failed AS (
        UPDATE transactions SET status='FAILED',updated_at=NOW()
        WHERE transaction_id =$1 AND status='PENDING'
        RETURNING account_id,amount 
        )
        UPDATE accounts a SET balance=a.balance-failed.amount, updated_at=NOW() FROM failed WHERE a.account_id = failed.account_id`,
        [tx.transaction_id],
      );
      return res
        .status(502)
        .json({
          message: "Withdrawal failed. Your balance has been restored.",
        });
    }
    // stripe succeed. change to completed
    await client.query(
      `UPDATE transactions SET status='COMPLETED',stripe_ref=$1,updated_at=NOW() WHERE transaction_id =$2`,
      [transfer.id, tx.transaction_id],
    );
    return res
      .status(200)
      .json({ message: "Withdrawal successful", transaction: tx });
  } catch (error) {
    console.error("Withdrawal error", error.message);
    const status = error.status || 500;
    return res.status(status).json({
      message: status >= 500 ? "Internal server error" : error.message,
      code: error.code,
    });
  } finally {
    client.release();
  }
};
// Peer-to-peer (User's account to another user's account)
const transferPeer = async (req, res) => {
  const {
    sender_account_id,
    receiver_account_number,
    amount: cents,
    description,
  } = req.valid.body;

  const client = await pool.connect();
  try {
    //BEGIN
    await client.query("BEGIN");
    const {
      rows: [receiver],
    } = await client.query(
      `SELECT a.account_id,u.username
      FROM accounts a JOIN users u ON u.user_id = a.user_id
      WHERE a.account_number =$1 AND a.account_type<>'escrow'`,
      [receiver_account_number],
    );
    if (!receiver) throw httpError(404, "Receiver account not found.");
    const {
      rows: [senderUser],
    } = await client.query(`SELECT username FROM users WHERE user_id = $1`, [
      req.user.id,
    ]);
    const { outRow } = await moveMoney(client, {
      sender_account_id: sender_account_id,
      receiver_account_id: receiver.account_id,
      cents,
      sender_user_id: req.user.id,
      checkLimits: true,
      type: "PEER_TRANSFER",
      outDesc: description || `Transfer to ${receiver.username}`,
      inDesc: description || `Transfer from ${senderUser.username}`,
    });
    //COMMIT
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Transfer completed",
      transaction: {
        transaction_id: outRow.transaction_id,
        amount: outRow.amount,
        description: outRow.description,
        created_at: outRow.created_at,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer failed, rolling back:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: status >= 500 ? "Internal server error" : error.message,
    });
  } finally {
    client.release();
  }
};
const internalTransfer = async (req, res) => {
  const {
    sender_account_id,
    receiver_account_id,
    amount: cents,
    description,
  } = req.valid.body;
  if (!sender_account_id || !receiver_account_id) {
    return res.status(400).json({ message: "Invalid accounts" });
  }


  const client = await pool.connect();
  try {
    //BEGIN
    await client.query("BEGIN");
    const { outRow } = await moveMoney(client, {
      sender_account_id: sender_account_id,
      receiver_account_id: receiver_account_id,
      cents,
      sender_user_id: req.user.id,
      receiver_user_id: req.user.id,
      type: "INTERNAL_TRANSFER",
      outDesc:
        description || ((from, to) => `Transfer to ${to.account_number}`),
      inDesc:
        description || ((from, to) => `Transfer from ${from.account_number}`),
    });
    //COMMIT
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Transfer completed",
      transaction: outRow,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer failed, rolling back:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      message: status >= 500 ? "Internal server error" : error.message,
    });
  } finally {
    client.release();
  }
};

const createDepositIntent = async (req, res) => {
  const { amount: rawAmount, account_id } = req.body;
  if (!account_id)
    return res.status(400).json({ message: "Account is required." });
  let cents;
  try {
    cents = toCents(rawAmount);
  } catch (e) {
    return res.status(e.status || 500).json({ message: e.message });
  }
  if (cents < 50)
    return res.status(422).json({ message: "Minimum deposit is $0.50" });
  try {
    const {
      rows: [account],
    } = await pool.query(
      `SELECT status
    FROM accounts WHERE account_id =$1 AND user_id=$2`,
      [account_id, req.user.id],
    );
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.status !== 'ACTIVE') return res.status(422).json({ message: "Account is not active"});
    const paymentIntent = await stripe.paymentIntents.create({
      amount:cents,
      currency:'sgd',
      payment_method_types:['card'],
      metadata:{user_id:req.user.id,account_id}
    });
    return res.status(200).json({clientSecret:paymentIntent.client_secret})
  } catch (error) {
    console.error("Stripe intent error: ", error.message);
    return res
      .status(500)
      .json({ message: "Server error creating deposit intent" });
  }
};
// For deposit
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log("Signature verified! Event type:", event.type);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { account_id } = paymentIntent.metadata;
    if (!account_id) return res.status(200).json({received:true,ignored:true})
    const amount = (paymentIntent.amount/100).toFixed(2)

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const {rows} = await client.query(
          `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,status,stripe_ref)
          VALUES ($1,$2,'Card',$3,'EXTERNAL_DEPOSIT','COMPLETED',$4)
          ON CONFLICT (stripe_ref) DO NOTHING
          RETURNING transaction_id
          `,[account_id,amount,`Card Deposit (${paymentIntent.id.slice(-8)})`,paymentIntent.id]
      );
      if (rows.length === 0 ){
        await client.query("ROLLBACK")
        return res.status(200).json({received:true,duplicate:true})
      }
      const updateResult = await client.query(
        `UPDATE accounts SET balance = balance + $1,updated_at=NOW() WHERE account_id = $2`,
        [amount, account_id],
      );
      if (updateResult.rowCount !==1){
        throw new Error(`Deposit ${paymentIntent.id} is for a missing account`);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Stripe webhook error:", error.message);
      return res.status(500).json({ error: "Database update failed" });
    } finally {
      client.release();
    }
  }

  res.status(200).json({ received: true });
};
const createConnectAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      `SELECT user_id,email,stripe_connect_id FROM users WHERE user_id = $1`,
      [req.user.id],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult.rows[0];
    let accountId = user.stripe_connect_id;
    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        dashboard: "none",
        identity: {
          country: "SG",
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: { requested: true },
              },
            },
          },
        },
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        include: ["configuration.recipient", "identity"],
      });
      accountId = account.id;
      await client.query(
        `UPDATE users SET stripe_connect_id =$1 WHERE user_id = $2`,
        [accountId, user.user_id],
      );
    }
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });
    return res
      .status(200)
      .json({ client_secret: accountSession.client_secret });
  } catch (error) {
    console.error("Stripe connection error", error.message);
    return res.status(500).json({ message: "Failed to generate connect link" });
  } finally {
    client.release();
  }
};
module.exports = {
  withdrawMoney,
  transferPeer,
  internalTransfer,
  createDepositIntent,
  handleStripeWebhook,
  createConnectAccount,
};
