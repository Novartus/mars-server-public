const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user").User;

const ChangedPassword = db.define(
  "changed_password",
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

    ip: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIP: true, // checks for IPv4 (129.89.23.1) or IPv6 format
      },
    },

    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    city: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    region: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    country: {
      type: Sequelize.STRING,
      allowNull: true,
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
      allowNull: false,
    },
  },
  {
    createdAt: false, // Don't create createdAt
    updatedAt: false, // Don't create updatedAt
  }
);

module.exports = {
  ChangedPassword,
};
