const Sequelize = require("sequelize");
const db = require("./db");
const Inquiry = require("./inquiry").Inquiry;
const User = require("./user").User;

const InquiryAttachment = db.define("inquiry_attachment", {
  inquiry_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Inquiry,
      key: "id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
  },

  test_mail_id: {
    type: Sequelize.STRING,
    allowNull: false,
    references: {
      model: Inquiry,
      key: "test_mail_id",
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
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

  filename: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  checksum: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  size: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },

  download_url: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  content_type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = {
  InquiryAttachment,
};
