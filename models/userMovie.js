const Sequelize = require("sequelize");
const db = require("./db");
const User = require("./user").User;

const UserMovie = db.define(
  "user_movie",
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

    movie_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true, // will only allow numbers
      },
    },

    movie_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    movie_genre_id: {
      type: Sequelize.JSONB, // will store array of objects
      allowNull: false,
    },

    poster_path: {
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
  UserMovie,
};
