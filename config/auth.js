require("dotenv").config();
module.exports = {
  facebookAuth: {
    clientID: `process.env.FACEBOOK_CLIENT_ID`,
    clientSecret: `process.env.FACEBOOK_CLIENT_SECRET`,
    callbackURL: `process.env.FACEBOOK_CALLBACK_URL`,
    profileURL: `process.env.FACEBOOK_PROFILE_URL`,
    profileFields: ["id", "email", "name"],
  },

  twitterAuth: {
    consumerKey: `process.env.TWITTER_CONSUMER_KEY`,
    consumerSecret: `process.env.TWITTER_CONSUMER_SECRET`,
    callbackURL: `process.env.TWITTER_CALLBACK_URL`,
  },

  googleAuth: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
};
