require("dotenv").config();
const fetch = require("node-fetch");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function validPassword(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}
function generateHash(password, salt) {
  return bcrypt.hashSync(password, salt);
}

function generateAccessToken(data) {
  // expires after half and hour (1800 seconds = 30 minutes)
  const token = jwt.sign(
    { user_id: data.id, admin: data.isAdmin },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: 10800, // expires in 3 hours
    }
  );
  const authToken = `Bearer ${token}`;
  return authToken;
}

async function validateHuman(token) {
  const reCAPTCHA_Secret = process.env.reCAPTCHA_Secret_Key;
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${reCAPTCHA_Secret}&response=${token}`,
    {
      method: "POST",
    }
  );
  const data = await response.json();
  return data.success;
}

module.exports = {
  validPassword,
  generateHash,
  generateAccessToken,
  validateHuman,
};
