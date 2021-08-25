const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user").User;

const UserData = db.define(
  "user_data",
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

    first_name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isAlpha: true, // will only allow letters
      },
    },

    last_name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isAlpha: true, // will only allow letters
      },
    },

    dob: {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: true, // only allow date strings
      },
    },

    gender: {
      type: Sequelize.ENUM("Male", "Female", "Unknown"),
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
  UserData,
};
