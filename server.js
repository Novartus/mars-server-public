require("dotenv").config();
const express = require("express");
const app = express();
const Sentry = require("@sentry/node");
const port = process.env.PORT || 8080;
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
// const configcat = require("configcat-node");

const chalk = require("chalk");
// const helmet = require("helmet");
const cors = require("cors");

//Route Files
const user = require("./routes/user");
const movie = require("./routes/movie");
const userData = require("./routes/userData");
const admin = require("./routes/admin");
const testMail = require("./routes/testMail");

app.use(express.json());

app.use(
  cors({
    origin: true, // allow to server to accept request from different origin
    methods: ["GET", "POST"],
    credentials: true, // allow session cookie from browser to pass through
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

// Routes
app.use("/api", user);
app.use("/api/user", userData);
app.use("/api/admin", admin);
app.use("/api/user/movie", movie);
app.use("/api/test/mail", testMail);

Sentry.init({
  dsn: `${process.env.SENTRY_DNS}`,
});
app.use(Sentry.Handlers.requestHandler());

app.use(Sentry.Handlers.errorHandler());
app.listen(port);

console.log(chalk.bgGreen.black("The magic happens on port " + port));
