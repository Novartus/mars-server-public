const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user").User;

const ResetPasswordToken = db.define(
  "reset_password_token",
  {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      references: {
        model: User,
        key: "email",
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },

    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    status: {
      type: Sequelize.ENUM("New", "Used", "Expired"),
      allowNull: false,
      default: "New",
    },

    verified_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    expiration_time: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    createdAt: false, // Don't create createdAt
    updatedAt: false, // Don't create updatedAt
  }
);

module.exports = {
  ResetPasswordToken,
};
