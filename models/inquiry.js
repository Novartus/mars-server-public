const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user").User;

const Inquiry = db.define("inquiry", {
  test_mail_id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },

  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },

  from_address: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },

  from_name: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  tag: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  subject: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  has_attachments: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },

  download_url: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  timestamp: {
    //Timestamp in milliseconds since January 1, 1970. This is the timestamp on the server that stored
    //and indexed the email at the time when it received the email from the SMTP server.
    type: Sequelize.FLOAT,
    allowNull: false,
  },

  date: {
    type: Sequelize.FLOAT,
    //Timestamp in milliseconds since January 1, 1970. Extracted from the date header (might not be accurate).
    allowNull: false,
  },
});

module.exports = {
  Inquiry,
};
