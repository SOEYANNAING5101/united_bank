const { z } = require("zod");

const uuid = z.uuid({ error: "Invalid ID" });

const money = z
  .number({ error: "Enter an amount like 25 or 25.50" })
  .positive({ error: "Amount must be greater than $0" })
  .multipleOf(0.01, { error: "Enter an amount like 25 or 25.50" })
  .max(9999999.99, { error: "Amount is too large" })
  .transform((n) => Math.round(n * 100));

const isDigit = (s) =>
  s.length > 0 && [...s].every((c) => c >= "0" && c <= "9");

const isMonth = (s) => {
  const parts = s.split("-");
  if (parts.length !== 2) return false;
  const [year, month] = parts;
  if (year.length !== 4 || !isDigit(year)) return false;
  if (month.length !== 2 || !isDigit(month)) return false;
  return Number(month) >= 1 && Number(month) <= 12;
};

const isDate = (s) => {
  const parts = s.split("-");
  if (parts.length !== 3) return false;
  const [year, month, day] = parts;
  if (year.length !== 4 || !isDigit(year)) return false;
  if (month.length !== 2 || !isDigit(month)) return false;
  if (day.length !== 2 || !isDigit(day)) return false;
  const date =  new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10)===s
};

const accountIdOrAll = z
  .string({ error: "Invalid ID" })
  .refine((v) => v === "all" || uuid.safeParse(v).success, {
    error: "Invalid ID",
  });

module.exports = { uuid, money, isDigit, isMonth,accountIdOrAll, isDate };
