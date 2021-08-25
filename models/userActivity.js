const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user").User;

const UserActivity = db.define(
  "user_activity",
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

    auth_token: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    in_time: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    out_time: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    ip: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIP: true, // checks for IPv4 (129.89.23.1) or IPv6 format
      },
    },

    browser: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    device: {
      type: Sequelize.STRING,
      allowNull: true,
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
  UserActivity,
};
