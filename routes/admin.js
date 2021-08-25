const express = require("express");
const router = express.Router();
const moment = require("moment");
// Middleware
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
// Models
const { User } = require("../models/user");
const { UserData } = require("../models/userData");
// Constant Message Responses
const RESPONSE_CODE = require("../constants/responseCode");

// router.get("/user/:id", authenticateToken, isAdmin, async (req, res) => {
//   await User.findOne({_id: req.params.id }, (err, user) => {
//     if (!user) {
//       return res
//         .status(RESPONSE_CODE.NOT_FOUND)
//         .send(VALIDATION.user_not_found);
//     }
//     const userData = {
//       Email: user.local.email,
//       Verified_at: user.local.verified_at,
//       Created_at: user.local.created_at,
//     };
//     return res.status(RESPONSE_CODE.OK).send({ data: userData, success: true });
//   });
// });

router.get("/all/users", authenticateToken, isAdmin, async (req, res) => {
  const users = await User.findAll({
    where: {
      is_admin: false,
    },
  });

  let usersDetails = [];

  for (let i = 0; i < users.length; i++) {
    const userData = await UserData.findOne({
      where: { user_id: users[i].id },
    });
    usersDetails.push({
      id: users[i].id,
      first_name: userData ? userData.first_name : "N/A",
      last_name: userData ? userData.last_name : "N/A",
      email: users[i].email,
      has_access: users[i].has_access ? "Yes" : "No",
      is_verified: users[i].is_verified ? "Yes" : "No",
      verified_at: users[i].verified_at
        ? moment(users[i].verified_at).format("DD MMM YYYY")
        : "N/A",
      created_at: moment(users[i].created_at).format("DD MMM YYYY"),
    });
  }
  return res
    .status(RESPONSE_CODE.OK)
    .send({ users: usersDetails, success: true });
});

module.exports = router;
