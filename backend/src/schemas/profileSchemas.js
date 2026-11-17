const { z } = require("zod");
const { isDate, isDigit } = require("./helper");
const COUNTRIES = ["SG", "US", "GB", "AU", "CA", "MY"];
const EMPLOYMENT = [
  "full-time",
  "part-time",
  "self-employed",
  "student",
  "retired",
  "unemployed",
  "others",
];
const WEALTH = [
  "salary",
  "business",
  "investments",
  "inheritance",
  "allowance",
  "savings",
  "others",
];
// Prep
const sgToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
const isAdult = (dob) => {
  const today = sgToday();
  const cutOff = `${Number(today.slice(0, 4)) - 18}${today.slice(4)}`;
  return dob <= cutOff;
};
const isPhone = (s) =>
  s[0] === "+" && s.length >= 9 && s.length <= 16 && isDigit(s.slice(1));

// Error messages
const ERROR_DOB = { error: "Date of birth must look like 1999-12-05" };
const ERROR_POSTAL = { error: "Postal code must be 6 digits" };
const ERROR_PHONE = {
  error: "Enter a phone number with country code, like +6591234567",
};
const ERROR_TAX = { error: "Tax ID must be exactly 4 digits" };
const text = (label, min, max) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, {
      error:
        min === 1
          ? `${label} is required`
          : `${label} must be at least ${min} characters`,
    })
    .max(max, { error: `${label} must be at most ${max} characters` });

const firstname = text("First name", 1, 50);
const lastname = text("Last name", 1, 50);
const dob = z
  .string(ERROR_DOB)
  .refine(isDate, ERROR_DOB)
  .refine(isAdult, {
    error: "You must be at least 18 years old to open an account",
  })
  .refine((v) => v >= "1900-01-01", {
    error: "Date of birth cannot be before 1900",
  });
const street_address = text("Street Address", 5, 255);
const city = text("City", 2, 50);
const state_province = z
  .string({ error: "State must be text" })
  .trim()
  .max(50, { error: "State name cannot exceed 50 characters" })
  .refine((v) => v === "" || v.length >= 2, {
    error: "State name is too short to be valid",
  })
  .optional();
const postal_code = z
  .string(ERROR_POSTAL)
  .length(6, ERROR_POSTAL)
  .refine(isDigit, ERROR_POSTAL);
const phone_number = z.string(ERROR_PHONE).trim().refine(isPhone, ERROR_PHONE);
const country = z.enum(COUNTRIES, { error: "Choose a country from the list" });
const taxId = z
  .string(ERROR_TAX)
  .length(4, ERROR_TAX)
  .refine(isDigit, ERROR_TAX);
const employment_status = z.enum(EMPLOYMENT, {
  error: "Choose an employment status from the list",
});
const source_of_wealth = z.enum(WEALTH, {
  error: "Choose a source of wealth from the list",
});

const submitProfileBody = z.object({
  firstname,
  lastname,
  dob,
  street_address,
  city,
  state_province,
  postal_code,
  phone_number,
  country,
  taxId,
  employment_status,
  source_of_wealth,
});

const financialBody = z.object({
  employment_status,
  source_of_wealth,
});
const contactBody = z.object({
  phone_number,
  street_address,
  city,
  state_province,
  postal_code,
  country,
});
module.exports = { submitProfileBody,financialBody,contactBody };
