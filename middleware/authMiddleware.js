require("dotenv").config();

const jwt = require("jsonwebtoken");
const { UserActivity } = require("../models/userActivity");
const VALIDATION = require("../constants/validation");
const SUCCESS = require("../constants/success");
const RESPONSE_CODE = require("../constants/responseCode");

module.exports = {
  authenticateToken: async (req, res, next) => {
    const authHeader = await req.headers["x-access-token"];
    const token = authHeader && authHeader.split(" ")[1]; // `Bearer ${TOKEN}`
    if (!token) {
      return res
        .status(401)
        .send({ auth: false, message: "No token provided." });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      try {
        const blacklisted_token = await UserActivity.findOne({
          where: {
            auth_token: authHeader, //`Bearer ${TOKEN}`
            user_id: user.user_id,
          },
        });
        if (blacklisted_token && blacklisted_token.out_time !== null) {
          return res
            .status(403)
            .send({ auth: false, message: "Token is blacklisted" });
        }
      } catch (error) {
        console.log("Error in Blacklisted_Token", error);
      }
      next();
    });
  },

  isAdmin: async (req, res, next) => {
    if (req.user.admin === true) {
      next();
    } else {
      return res.status(RESPONSE_CODE.UNAUTHORIZED).send(VALIDATION.not_admin);
    }
  },
};
