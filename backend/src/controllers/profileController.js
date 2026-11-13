const pool = require("../db/db");
const submitProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (req.user.hasProfile){
      return res.status(409).json({message:"Your profile is already set up."})
    }

    const {
      firstname,
      lastname,
      dob,
      streetaddress,
      city,
      stateprovince = "N/A",
      postal,
      phonenumber,
      country,
      taxId,
      employmentstatus,
      sourceofwealth,
    } = req.body;
    if (
      !firstname ||
      !lastname ||
      !dob ||
      !streetaddress ||
      !city ||
      !postal ||
      !phonenumber ||
      !country ||
      !taxId ||
      !employmentstatus ||
      !sourceofwealth
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    if (!/^\d{4}$/.test(taxId)) {
      return res
        .status(400)
        .json({ message: "Tax ID must be exactly 4 digits." });
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old to open an account.",
      });
    }

    const { rows: insertedProfile } = await pool.query(
      `INSERT INTO user_profiles
        (user_id,first_name,last_name,dob,phone_number,street_address,city,state_province,postal_code,country,employment_status,source_of_wealth,tax_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
      [
        user_id,
        firstname,
        lastname,
        dob,
        phonenumber,
        streetaddress,
        city,
        stateprovince,
        postal,
        country,
        employmentstatus,
        sourceofwealth,
        taxId,
      ],
    );

    return res.status(200).json({
      message: "Profile created successfully.",
      profile: insertedProfile[0],
    });
  } catch (error) {
    console.error("Error submitting profile", error.message);
    return res
      .status(500)
      .json({ message: "Server error during submitting profile data. " });
  }
};
const checkProfileStatus = async (req, res) => {
  return res.status(200).json({isVerified:req.user.hasProfile})
};
const getProfileData = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.user_id, p.*
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE u.user_id = $1`,
      [req.user.id],
    );
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error checking profile status: ", error.message);
    return res.status(500).json({ message: "Server error fetching profile." });
  }
};
const updateFinancial = async (req, res) => {
  const { employment_status, source_of_wealth } = req.body;
  if (!employment_status || !source_of_wealth) {
    return res.status(400).json({ message: "Empty data." });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE user_profiles
        SET
      employment_status = $1,
      source_of_wealth = $2,
      updated_at = NOW()
      WHERE user_id = $3
      RETURNING *
      `,
      [employment_status, source_of_wealth, req.user.id],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Error updating user financial details" });
    }
    res.status(200).json({
      message: "User financial details updated successfully.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating financial details: ", error.message);
    return res
      .status(500)
      .json({ message: "Server error updating financial details" });
  }
};
const updateContact = async (req, res) => {
  const {
    phone_number,
    street_address,
    city,
    state_province,
    postal_code,
    country,
  } = req.body;
  if (!street_address || !city || !postal_code || !country || !phone_number) {
    return res.status(400).json({ message: "Empty data." });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE user_profiles
        SET
      phone_number = $1,
      street_address = $2,
      city = $3,
      state_province = $4,
      postal_code = $5,
      country = $6,
      updated_at = NOW()
      WHERE user_id = $7
      RETURNING *
      `,
      [
        phone_number,
        street_address,
        city,
        state_province,
        postal_code,
        country,
        req.user.id,
      ],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Error updating user financial details" });
    }
    res.status(200).json({
      message: "User contact information updated successfully.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating contact information: ", error.message);
    return res
      .status(500)
      .json({ message: "Server error updating contact information" });
  }
};
module.exports = {
  submitProfile,
  checkProfileStatus,
  getProfileData,
  updateContact,
  updateFinancial,
};
