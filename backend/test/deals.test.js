const { TRANSITIONS, nextDeadlines } = require("../src/services/dealService");

describe("nextDeadlines", () => {
  const onlyOneSet = (deadlines, field) => {
    expect(deadlines[field]).toBeInstanceOf(Date);
    for (const [key, value] of Object.entries(deadlines)) {
      if (key !== field) expect(value).toBeNull();
    }
  };

  test("CREATED sets only pay_by", () => onlyOneSet(nextDeadlines("CREATED"), "pay_by"));
  test("FUNDED sets only ship_by", () => onlyOneSet(nextDeadlines("FUNDED"), "ship_by"));
  test("SHIPPED sets only deliver_by", () => onlyOneSet(nextDeadlines("SHIPPED"), "deliver_by"));
  test("DELIVERED sets only auto_release_at", () =>
    onlyOneSet(nextDeadlines("DELIVERED"), "auto_release_at"));

  test("final and frozen states have no deadline", () => {
    for (const status of ["RELEASED", "REFUNDED", "CANCELLED", "EXPIRED", "DISPUTED"]) {
      const deadlines = nextDeadlines(status);
      expect(Object.values(deadlines).every((v) => v === null)).toBe(true);
    }
  });
});

describe("TRANSITIONS table", () => {
  const STATUSES = ["CREATED","FUNDED","SHIPPED","DELIVERED","DISPUTED","RELEASED","REFUNDED","CANCELLED","EXPIRED"];
  const ROLES = ["BUYER", "SELLER", "SYSTEM", "ADMIN"];
  const MONEY = [null, "DEAL_HOLD", "DEAL_RELEASE", "DEAL_REFUND"];

  test.each(Object.entries(TRANSITIONS))("%s is well-formed", (_name, rule) => {
    rule.from.forEach((s) => expect(STATUSES).toContain(s));
    rule.by.forEach((r) => expect(ROLES).toContain(r));
    expect(STATUSES).toContain(rule.to);
    expect(MONEY).toContain(rule.money);
  });

  test("any money move ends in a settled state", () => {
    for (const rule of Object.values(TRANSITIONS)) {
      if (rule.money) expect(["FUNDED", "RELEASED", "REFUNDED"]).toContain(rule.to);
    }
  });
});