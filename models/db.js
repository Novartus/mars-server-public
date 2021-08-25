require("dotenv").config();
const Sequelize = require("sequelize");
// const fs = require("fs");

//Database Configuration for Azure PostgreSQL
// const db = new Sequelize(
//   `${process.env.POSTGRES_DB}`,
//   `${process.env.POSTGRES_USERNAME}`,
//   `${process.env.POSTGRES_PASSWORD}`,
//   {
//     host: `${process.env.POSTGRES_HOST}`,
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: true,
//     },
//     port: 5432,
//     omitNull: false,
//     logging: false,
//   }
// );

//Database Configuration for local PostgreSQL
const db = new Sequelize("mars", "postgres", "root", {
  dialect: "postgres",
  port: 5432,
  omitNull: false,
  logging: false,
});

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

module.exports = db;
require("./user");

db.sync() //sync({force: true})
  .then(() => console.log("Tables Created If Not Existed!"));
