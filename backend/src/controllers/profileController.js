const { Profiler } = require("react");
const pool = require("../db/db");
const submitProfile = async (req, res) => {
  try {
    const clerk_user_id = req.auth.userId;
    const user_check = await pool.query(
      `SELECT user_id FROM users WHERE clerk_user_id =$1`,
      [clerk_user_id],
    );
    if (user_check.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = user_check.rows[0].user_id;
    
    const {firstname,lastname,dob,streetaddress,city,stateprovince="N/A", postal, phonenumber, country, taxId, employmentstatus, sourceofwealth} = req.body;
    if (!firstname || !lastname || !dob || !streetaddress || !city  || !postal || !phonenumber || !country || !taxId || !employmentstatus || !sourceofwealth){
        return res.status(400).json({message: "All fields are required!"})
    }
    if ( !/^\d{4}$/.test(taxId)){
        return res.status(400).json({message: "Tax ID must be exactly 4 digits."})
    }

    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear();
    const m =  today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18 ) {
        return res.status(400).json({message:"You must be at least 18 years old to open an account."})
    }
    // let stateprovince = req.body
    // if (!stateprovince){
    //     stateprovince = "N/A"
    // }
    
    const {rows: insertedProfile} = await  pool.query(
        `INSERT INTO user_profiles
        (user_id,first_name,last_name,dob,phone_number,street_address,city,state_province,postal_code,country,employment_status,source_of_wealth,tax_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [user_id,firstname,lastname,dob,phonenumber,streetaddress,city,stateprovince, postal,country, employmentstatus, sourceofwealth,taxId]
    )
    console.log(newProfile)


    return res.status(200).json({
      message: "Profile created successfully.",
      profile: insertedProfile[0]
    });
  } catch (error) {
    console.error("Error submitting profile", error.message);
    return res
      .status(500)
      .json({ message: "Server error during submitting profile data. " });
  }
};
module.exports = { submitProfile };
