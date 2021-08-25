const Sequelize = require("sequelize");
const db = require("./db");

const User = db.define(
  "user",
  {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
    },

    is_admin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    has_access: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    is_verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    verification_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    verified_at: {
      type: Sequelize.DATE,
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
  User,
};
