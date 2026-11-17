const httpError = require("./httpError");
function toCents(input) {
  const s = String(input ?? "").trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(s)) {
    throw httpError(422, "Enter an amount like 25 or 25.50");
  }
  const cents = Math.round(Number(s) * 100);
  if (cents <= 0) throw httpError(422, "Amount must be more than $0");
  return cents;
}
const dbToCents = (value)=>Math.round(Number(value)*100)
module.exports = {toCents,dbToCents}