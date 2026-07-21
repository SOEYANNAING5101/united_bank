const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/db");
const { requireKyc } = require("../src/middleware/kycMiddleware");
const expectCookies = require("supertest/lib/cookies");

jest.mock("@clerk/clerk-sdk-node", () => ({
  ClerkExpressRequireAuth: () => (req, res, next) => {
    req.auth = { userId: "mock_clerk_user_id" };
    next();
  },
}));

jest.mock("../src/middleware/kycMiddleware", () => ({
  requireKyc: (req, res, next) => next(),
}));

jest.mock(
  "../src/middleware/idempotencyMiddleware.js",
  () => (req, res, next) => next(),
);

jest.mock("../src/db/db", () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
}));

// Deposit Money
describe("POST /api/transactions/deposit", () => {
  // Authorized clerk user id
  it("should return 404 if the user is not found in the system", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const response = await request(app).post("/api/transactions/deposit").send({
      account_id: "fake_account_id",
      amount: 500,
      counterparty: "External Bank",
    });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });
  // Missing amount
  it("should return 400 if the amount is missing", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const response = await request(app).post("/api/transactions/deposit").send({
      account_id: "fake_account_id",
      counterparty: "External Bank",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Valid account ID and positive amount are required.",
    });
  });
  // Amount less than or equal to zero
  it("should return 400 if the amount is zero or negative", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const response = await request(app).post("/api/transactions/deposit").send({
      account_id: "fake_account_id",
      amount: -500,
      counterparty: "External Bank",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Valid account ID and positive amount are required.",
    });
  });
  // Account not found in database/ unauthorized
  it("should return 400 if the account is not found or authorized", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce(); //Mock for BEGIN
    mockClient.query.mockResolvedValueOnce({ rows: [] }); //Mock for COMMIT
    mockClient.query.mockResolvedValueOnce(); //Mock for ROLLBACK

    const response = await request(app).post("/api/transactions/deposit").send({
      account_id: "wrong_account_id",
      amount: 500,
      counterparty: "External Bank",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Access denied: Account not found or unauthorized",
    });
  });
  // Server error/catch block
  it("should return 500 and rollback if a database error occurs", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce(); //Mock for BEGIN
    mockClient.query.mockRejectedValueOnce(
      new Error("Neon database went offline"),
    ); //Mock for COMMIT

    const response = await request(app).post("/api/transactions/deposit").send({
      account_id: "acc_id",
      amount: 500,
      counterparty: "External Bank",
    });
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Neon database went offline");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Successful Deposit
  it("should return 200 and successful transaction data", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ account_id: "acc_123" }] })
      .mockResolvedValueOnce({ rows: [{ balance: 5000 }] })
      .mockResolvedValueOnce({
        rows: [{ transaction_id: "txn_789", amount: 500 }],
      })
      .mockResolvedValueOnce();

    const response = await request(app).post("/api/transactions/deposit").send({
      account_id: "acc_id",
      amount: 500,
      transaction_id: "txn_789",
      counterparty: "External Bank",
      description: "Deposit from External Bank",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Deposit Successful");
    expect(response.body.newBalance).toBe(5000);
    expect(response.body.transaction.transaction_id).toBe("txn_789");

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
//Withdraw money
describe("POST /api/transactions/withdraw", () => {
  // Authorized clerk user id
  it("should return 404 if the user is not found in the system", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "fake_account_id",
        amount: 500,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });
  // Missing amount
  it("should return 400 if the amount is missing", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "fake_account_id",
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Valid account ID and positive amount are required.",
    });
  });
  // Amount less than or equal to zero
  it("should return 400 if the amount is zero or negative", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "fake_account_id",
        amount: -500,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Valid account ID and positive amount are required.",
    });
  });
  // Sender account not found
  it("should return 400 if the sender account is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "wrong_account_id",
        amount: 500,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Sender account not found");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Insufficient funds
  it("should return 400 if current balance is less than transfer amount", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ balance: 500 }] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "acc_id",
        amount: 1000,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Insufficient funds for this transfer");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Exceed per transfer limit
  it("should return 400 if transfer amount exceeds the per-transfer limit", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce().mockResolvedValueOnce({
      rows: [{ balance: 50000, txn_limit_per_transfer: 5000 }],
    });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "acc_id",
        amount: 6000,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Transfer amount exceeds limit of 5000");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Exceed daily transfer limit
  it("should return 400 if transfer amount exceeds the daily transfer limit", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 50000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 8000 }] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "acc_id",
        amount: 3000,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Transfer exceeds daily limit. You have $2,000 remaining for today",
    );

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Exceed monthly transfer limit
  it("should return 400 if transfer amount exceeds the monthly transfer limit", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 10000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
            monthly_transfer_limit: 20000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 1000 }] })
      .mockResolvedValueOnce({ rows: [{ total_this_month: 18000 }] });
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "acc_id",
        amount: 3000,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Transfer exceeds monthly limit. You have $2,000 remaining for this month",
    );

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Server error/catch block
  it("should return 500 and rollback if a database error occurs", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce(); //Mock for BEGIN
    mockClient.query.mockRejectedValueOnce(
      new Error("Neon database went offline"),
    ); //Mock for COMMIT

    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "acc_id",
        amount: 500,
        counterparty: "External Bank",
      });
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Neon database went offline");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Successful withdraw money
  it("should return 200 and successful transaction data", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);

    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 10000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
            monthly_transfer_limit: 20000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 1000 }] })
      .mockResolvedValueOnce({ rows: [{ total_this_month: 200 }] })
      .mockResolvedValueOnce({ rows: [{ balance: 7000 }] })
      .mockResolvedValueOnce({
        rows: [{ transaction_id: "txn_999", amount: -3000 }],
      })
      .mockResolvedValueOnce();
    const response = await request(app)
      .post("/api/transactions/withdraw")
      .send({
        account_id: "acc_id",
        amount: 3000,
        counterparty: "External Bank",
        description: "Withdrawal to External Bank",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Withdrawal Successful");
    expect(response.body.newBalance).toBe(7000);
    expect(response.body.transaction.transaction_id).toBe("txn_999");

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
// Peer-to-peer
describe("POST /api/transactions/peer-transfer", () => {
  // Authorized clerk user id
  it("should return 404 if the user is not found in the system", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_number: "receiver_123",
        amount: 500,
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });
  // Missing amount
  it("should return 400 if the fields are missing or amount is invalid", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender_123",
        amount: -500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid accounts or amount",
    });
  });
  // Sender account not found
  it("should return 400 if the sender account is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "wrong_sender_id",
        receiver_account_number: "receiver_123",
        amount: 500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Sender account not found");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Insufficient funds
  it("should return 400 if current balance is less than transfer amount", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ balance: 500 }] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender-123",
        receiver_account_number: "receiver_123",
        amount: 600,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Insufficient funds for this transfer");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Exceed per transfer limit
  it("should return 400 if transfer amount exceeds the per-transfer limit", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce().mockResolvedValueOnce({
      rows: [{ balance: 50000, txn_limit_per_transfer: 5000 }],
    });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender-123",
        receiver_account_number: "receiver_123",
        amount: 6000,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Transfer amount exceeds limit of 5000");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Exceed daily transfer limit
  it("should return 400 if transfer amount exceeds the daily transfer limit", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 50000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 8000 }] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender-123",
        receiver_account_number: "receiver_123",
        amount: 3000,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Transfer exceeds daily limit. You have $2,000 remaining for today",
    );

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Exceed monthly transfer limit
  it("should return 400 if transfer amount exceeds the monthly transfer limit", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 10000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
            monthly_transfer_limit: 20000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 1000 }] })
      .mockResolvedValueOnce({ rows: [{ total_this_month: 18000 }] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender-123",
        receiver_account_number: "receiver_123",
        amount: 3000,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Transfer exceeds monthly limit. You have $2,000 remaining for this month",
    );

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Receiver account not found
  it("should return 400 if receiver account is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 10000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
            monthly_transfer_limit: 20000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 0 }] })
      .mockResolvedValueOnce({ rows: [{ total_this_month: 0 }] })
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender-123",
        receiver_account_number: "wrong_receiver_number",
        amount: 500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Receiver account not found");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //To same account
  it("should return 400 if sender tries to transfer to the same account", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 10000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
            monthly_transfer_limit: 20000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 0 }] })
      .mockResolvedValueOnce({ rows: [{ total_this_month: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ account_id: "sender_123", username: "same_user" }],
      });
    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_number: "receiver_123",
        amount: 500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Cannot tranfer money to same account");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Server error/catch block
  it("should return 500 and rollback if a database error occurs", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce(); //Mock for BEGIN
    mockClient.query.mockRejectedValueOnce(
      new Error("Neon database went offline"),
    ); //Mock for COMMIT

    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_number: "receiver_456",
        amount: 500,
      });
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Neon database went offline");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Successful transfer peer-to-peer
  it("should return 200 and successful transaction data", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            balance: 10000,
            txn_limit_per_transfer: 5000,
            daily_transfer_limit: 10000,
            monthly_transfer_limit: 20000,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_today: 0 }] })
      .mockResolvedValueOnce({ rows: [{ total_this_month: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ account_id: "recv_456", username: "ReceiverName" }],
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{ transaction_id: "txn_peer_999", amount: -500 }],
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    const response = await request(app)
      .post("/api/transactions/peer-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_number: "receiver_456",
        amount: 500,
        description: "Transfer from Yan",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Transfer completed");
    expect(response.body.transaction.transaction_id).toBe("txn_peer_999");

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
// Internal transfer
describe("POST /api/transactions/internal-transfer", () => {
  // Authorized clerk user id
  it("should return 404 if the user is not found in the system", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_id: "receiver_456",
        amount: 500,
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });
  // Missing fields or invalid amount
  it("should return 400 if the fields are missing or amount is invalid", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "sender_123",
        amount: -500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid accounts or amount",
    });
  });
  // Sender account not found
  it("should return 400 if the sender account is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "wrong_sender_id",
        receiver_account_id: "receiver_456",
        amount: 500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Sender account not found");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Insufficient funds
  it("should return 400 if current balance is less than transfer amount", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ balance: 500 }] });
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "sender-123",
        receiver_account_id: "receiver_456",
        amount: 600,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Insufficient funds for this withdrawal",
    );

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Receiver account not found
  it("should return 400 if the receiver account is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{ balance: 1000, account_number: "sender_acc_123" }],
      })
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_id: "wrong_receiver_id",
        amount: 500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Receiver account not found");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // To same transfer
  it("should return 400 if the receiver account is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{ balance: 1000, account_number: "acc_123" }],
      })
      .mockResolvedValueOnce({ rows: [{ account_number: "acc_123" }] });
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "same_account_id",
        receiver_account_id: "same_account_id",
        amount: 500,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Cannot transfer to the same account");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  // Server error/catch block
  it("should return 500 and rollback if a database error occurs", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query.mockResolvedValueOnce()
    mockClient.query.mockRejectedValueOnce(new Error("Neon database went offline"));
    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_id: "receiver-123",
        amount: 500,
      });
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Neon database went offline");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
  //Successful internal transfer
    // To same transfer
  it("should return 200 and successful transaction data", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: "fake_user_uuid" }] });
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValueOnce(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{ balance: 1000, account_number: "acc_123" }],
      })
      .mockResolvedValueOnce({ rows: [{ account_number: "acc_456" }] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({rows:[{transaction_id:"txn_internal_999",amount:-500}]})
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()


    const response = await request(app)
      .post("/api/transactions/internal-transfer")
      .send({
        sender_account_id: "sender_123",
        receiver_account_id: "receiver_456",
        amount: 500,
        description:"Transfer to Khit"
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Transfer completed");
    expect(response.body.transaction.transaction_id).toBe("txn_internal_999");

    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
