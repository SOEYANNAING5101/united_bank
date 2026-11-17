const { toCents, dbToCents } = require("../src/utils/money");

describe("toCents", () => {
  test("whole dollars", () => expect(toCents(25)).toBe(2500));
  test("string with decimals", () => expect(toCents("25.50")).toBe(2550));
  test("trims whitespace", () => expect(toCents(" 10 ")).toBe(1000));
  test("one decimal place", () => expect(toCents("0.5")).toBe(50));

  test.each(["abc", "", "-5", "10.005", "1e3", "12345678", null, undefined])(
    "rejects %p",
    (bad) => expect(() => toCents(bad)).toThrow(),
  );

  test("rejects zero with the right message", () =>
    expect(() => toCents("0")).toThrow("more than $0"));

  test("errors carry a 422 status", () => {
    expect.assertions(1);
    try {
      toCents("abc");
    } catch (e) {
      expect(e.status).toBe(422);
    }
  });
});

describe("dbToCents", () => {
  test("numeric string from Postgres", () => expect(dbToCents("10.00")).toBe(1000));
  test("rounds a float cleanly", () => expect(dbToCents(19.99)).toBe(1999));
});