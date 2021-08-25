const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const moment = require("moment");
const IPinfoWrapper = require("node-ipinfo");
const ipinfoWrapper = new IPinfoWrapper(process.env.IP_INFO_TOKEN);

// Middleware
const { authenticateToken } = require("../middleware/authMiddleware");

// Models
const { User } = require("../models/user");
const { UserData } = require("../models/userData");
const { UserActivity } = require("../models/userActivity");
const { ResetPasswordToken } = require("../models/resetPasswordToken");
const { ChangedPassword } = require("../models/changedPassword");

// Front-End URL
const { url } = require("../url");

// Constant Message Responses
const VALIDATION = require("../constants/validation");
const SUCCESS = require("../constants/success");
const RESPONSE_CODE = require("../constants/responseCode");
const FAILURE = require("../constants/failure");

// Mail Sender
const { mailer } = require("../transporter/mailer");

// Helper Functions
const {
  generateHash,
  validPassword,
  generateAccessToken,
  validateHuman,
} = require("../auth/helper");
const { randomCode } = require("../utils/randomCode");

router.get("/checkError", (req, res) => {
  throw new Error("Error Checking!");
});

router.get("/", (_, res) => {
  return res
    .status(RESPONSE_CODE.OK)
    .send({ message: "Welcome To Mars", success: true });
});

router.get("/profile", authenticateToken, (req, res) => {
  return res.status(RESPONSE_CODE.OK).send({ data: req.user, success: true });
});

router.post("/logout", authenticateToken, async (req, res) => {
  if (req.user) {
    const token = req.headers["x-access-token"];
    try {
      const userActivity = await UserActivity.findOne({
        where: { auth_token: token, user_id: req.user.user_id },
      });

      await userActivity.update({
        out_time: new Date(),
        updated_at: new Date(),
      });

      return res.status(RESPONSE_CODE.OK).send({
        auth: false,
        message: SUCCESS.logged_out,
        success: false,
        token: null,
      });
    } catch (error) {
      console.log("Error on LogOut", error);
    }
  } else {
    return res
      .status(RESPONSE_CODE.OK)
      .send({ message: "No User Found", success: false });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password, browser, device, user_ip } = req.body;
  let isFirstTime = true;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user || !email || !password) {
      return res
        .status(422)
        .send({ message: "You must provide valid email and password." });
    }

    if (validPassword(password, user.password)) {
      const token = generateAccessToken({
        id: user.id,
        isAdmin: user.is_admin,
      });

      // const remoteAddress =
      //   req.headers["x-forwarded-for"] ||
      //   req.connection.remoteAddress ||
      //   req.socket.remoteAddress ||
      //   (req.connection.socket ? req.connection.socket.remoteAddress : null);
      // const array = remoteAddress.split(":");
      // const remoteIP = array[array.length - 1];

      await UserActivity.create({
        user_id: user.id,
        auth_token: token,
        in_time: new Date(),
        browser: browser,
        device: device,
        ip: user_ip,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const userData = await UserData.findOne({ where: { user_id: user.id } });

      if (userData.dob !== null && userData.gender !== null) {
        isFirstTime = false;
      }
      const name = `${userData.first_name} ${userData.last_name}`;

      return res.status(RESPONSE_CODE.OK).send({
        message: "Success Login",
        name: name,
        verified: user.is_verified,
        isAdmin: user.is_admin,
        isFirstTime: isFirstTime,
        success: true,
        token: token,
      });
    } else {
      return res.status(RESPONSE_CODE.BAD_REQUEST).send({
        message: "Invalid Details",
        success: false,
      });
    }
  } catch (err) {
    console.log("Error in Login", err);
  }
});

router.post("/signup", async (req, res, next) => {
  const password = req.body.password;
  let email = req.body.email;

  const human = await validateHuman(req.body.token);
  if (!human || !req.body.token) {
    return res.status(RESPONSE_CODE.BAD_REQUEST).send({
      message: "Nice Try Bot !",
      success: false,
    });
  }

  if (email) {
    email = email.toLowerCase();
  }
  try {
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      return res
        .status(422)
        .send({ message: "Email already exists", success: false });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashed_password = generateHash(password, salt);
    const verification_code = randomCode();
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;

    try {
      const newUser = await User.create({
        email: email,
        password: hashed_password,
        verification_code: verification_code,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (newUser.id > 0) {
        await UserData.create({
          user_id: newUser.id,
          first_name: first_name,
          last_name: last_name,
          created_at: new Date(),
          updated_at: new Date(),
        });
        await mailer(
          `${first_name} ${last_name}`,
          email,
          verification_code,
          "registration"
        );
      }
    } catch (error) {
      console.error(error);
    }

    return res
      .status(RESPONSE_CODE.OK)
      .send({ message: "Success SignUp", success: true });
  } catch (error) {
    console.log("\n\n Error SignUp", error);
  }
});

// Create Current Password
router.post(
  "/user/change/password",
  authenticateToken,
  async (req, res, next) => {
    const user_id = req.user.user_id;
    const current_password = req.body.current_password;
    const new_password = req.body.new_password;
    const browser = req.body.browser;
    const device = req.body.device;
    const user_ip = req.body.user_ip;

    const user = await User.findOne({ where: { id: user_id } });

    const userData = await UserData.findOne({ where: { user_id: user_id } });

    if (user !== null && validPassword(current_password, user.password)) {
      const salt = bcrypt.genSaltSync(10);
      const hashed_password = generateHash(new_password, salt);
      const old_hashed_password = generateHash(current_password, salt);

      if (hashed_password === old_hashed_password) {
        return res.status(RESPONSE_CODE.BAD_REQUEST).send({
          message: "New password should not be same with current password",
          success: false,
        });
      }

      await user.update({
        password: hashed_password,
        updated_at: new Date(),
      });
      const ipData = await ipinfoWrapper.lookupIp(user_ip);

      const changedPasswordDetails = await ChangedPassword.create({
        user_id: user_id,
        ip: user_ip,
        browser: browser,
        device: device,
        location: ipData.loc,
        city: ipData.city,
        region: ipData.region,
        country: ipData.country,
        created_at: moment.utc(),
      });

      await mailer(
        `${userData.first_name} ${userData.last_name}`,
        user.email,
        changedPasswordDetails,
        "passwordUpdate"
      );

      return res.status(RESPONSE_CODE.OK).send({
        message: "Password Updated Successfully",
        success: true,
      });
    } else {
      return res.status(RESPONSE_CODE.BAD_REQUEST).send({
        message: "Invalid valid current password",
        success: false,
      });
    }
  }
);

// Create Password Reset Request
router.post("/user/reset/password", async (req, res, next) => {
  const token = crypto.randomBytes(32).toString("hex");
  const email = req.body.email;
  const user = await User.findOne({ where: { email: email } });

  if (user !== null) {
    try {
      await ResetPasswordToken.update(
        {
          status: "Expired",
          updated_at: new Date(),
        },
        {
          where: {
            user_id: user.id,
            status: "New",
          },
        }
      );

      await ResetPasswordToken.create({
        user_id: user.id,
        email: email,
        token: token,
        status: "New",
        expiration_time: new Date().setTime(
          new Date().getTime() + 2 * 60 * 60 * 1000
        ), // 2 hour
        created_at: new Date(),
        updated_at: new Date(),
      });
      await mailer(
        "user",
        email,
        `${url}/user/reset/password/${token}`,
        "forgot"
      );
    } catch (error) {
      console.log("Reset Password Token Error:", error);
    }
    return res.status(RESPONSE_CODE.OK).send({
      message: "Password Reset Link Sent",
      success: true,
    });
  } else {
    return res.status(RESPONSE_CODE.BAD_REQUEST).send({
      message: "No user found",
      success: false,
    });
  }
});

// Resend Verification Code
router.post(
  "/user/resend/verification/code",
  authenticateToken,
  async (req, res, next) => {
    const user_id = req.user.user_id;
    const user = await User.findOne({ where: { id: user_id } });
    const verification_code = user.verification_code;

    if (user.is_verified) {
      return res
        .status(RESPONSE_CODE.BAD_REQUEST)
        .send({ message: "User is already verified", success: false });
    }

    const userData = await UserData.findOne({ where: { user_id: user_id } });
    await mailer(
      `${userData.first_name} ${userData.last_name}`,
      user.email,
      verification_code,
      "resendCode"
    );

    return res
      .status(RESPONSE_CODE.OK)
      .send({ message: "Verification Code Sent", success: true });
  }
);

// Email Verification using Code
router.post("/user/verify/email", authenticateToken, async (req, res, next) => {
  const user_id = req.user.user_id;
  const verification_code = req.body.verification_code;
  const user = await User.findOne({ where: { id: user_id } });

  if (user.is_verified) {
    return res
      .status(RESPONSE_CODE.BAD_REQUEST)
      .send({ message: "User is already verified", success: false });
  }

  if (verification_code == user.verification_code) {
    // Type can be string or number
    await user.update({
      verification_code: null,
      is_verified: true,
      verified_at: new Date(),
      updated_at: new Date(),
    });
    return res.status(RESPONSE_CODE.OK).send({
      message: "User verified",
      email: user.email,
      isFirstTime: true,
      verified: true,
      success: true,
    });
  } else {
    return res
      .status(RESPONSE_CODE.BAD_REQUEST)
      .send({ message: "Invalid Code", success: false });
  }
});

//If Verifies then redirect to another page and take token from parameters
router.post("/user/verify/token", async (req, res, next) => {
  const token = req.body.token;
  const resetTokenData = await ResetPasswordToken.findOne({
    where: { token: token },
  });

  if (
    resetTokenData !== null &&
    resetTokenData.status === "New" &&
    resetTokenData.expiration_time > new Date()
  ) {
    return res.status(RESPONSE_CODE.OK).send({
      message: "Token is verified",
      verified: true,
      success: true,
    });
  } else {
    return res.status(RESPONSE_CODE.BAD_REQUEST).send({
      message: "Expired or Don't Exists",
      success: false,
    });
  }
});

// Change Password after verified token
router.post("/user/verified/token", async (req, res, next) => {
  const token = req.body.token;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;

  if (password !== confirm_password) {
    return res.status(RESPONSE_CODE.BAD_REQUEST).send({
      message: "Password and Confirm Password don't match",
      success: false,
    });
  }

  const resetTokenData = await ResetPasswordToken.findOne({
    where: { token: token },
  });

  const salt = bcrypt.genSaltSync(10);
  const hashed_password = generateHash(password, salt);

  if (
    resetTokenData !== null &&
    resetTokenData.status === "New" &&
    resetTokenData.expiration_time > new Date()
  ) {
    const user = await User.findOne({
      where: {
        id: resetTokenData.user_id,
      },
    });

    await user.update({
      password: hashed_password,
      updated_at: new Date(),
    });

    await resetTokenData.update({
      status: "Used",
      verified_at: new Date(),
      updated_at: new Date(),
    });
    return res.status(RESPONSE_CODE.OK).send({
      success: true,
      password_changed: true,
    });
  } else {
    return res.status(RESPONSE_CODE.BAD_REQUEST).send({
      message: "Expired or Don't Exists",
      success: false,
    });
  }
});

module.exports = router;
