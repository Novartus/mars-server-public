const express = require("express");
const moment = require("moment");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { UserData } = require("../models/userData");

const RESPONSE_CODE = require("../constants/responseCode");

router.get("/", (_, res) => {
  return res
    .status(RESPONSE_CODE.OK)
    .send({ message: "Welcome To User Route", success: true });
});

// User add movies
router.post("/firstTime", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const gender = req.body.gender;
    const dob = req.body.dob;

    const userData = await UserData.findOne({
      where: {
        user_id: user_id,
      },
    });

    if (userData.dob !== null && userData.gender !== null) {
      return res.status(RESPONSE_CODE.BAD_REQUEST).send({
        message: "First Time Login Data Already Exists",
        success: false,
      });
    }

    if (userData) {
      const currentDate = moment();
      const userDate = moment(dob, "YYYY-MM-DD");
      const age = currentDate.diff(userDate, "years");
      if (!age >= 18) {
        return res.status(RESPONSE_CODE.BAD_REQUEST).send({
          message: "You must be at least 18 years old ",
          success: false,
        });
      }
      await userData.update({
        gender: gender,
        dob: dob,
        updated_at: new Date(),
      });
      return res
        .status(RESPONSE_CODE.OK)
        .send({ message: "First Time Login Data Updated", success: true });
    }
  } catch (error) {
    console.error("First Time Login Data Error:", error);
  }
});

module.exports = router;
