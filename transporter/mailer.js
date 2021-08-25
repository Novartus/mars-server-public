require("dotenv").config();
const moment = require("moment");
const configcat = require("configcat-node");
const nodemailer = require("nodemailer");
const Email = require("email-templates");

const configCatClient = configcat.createClient(process.env.CONFIG_CAT_SDK);

async function mailer(name, user_email, data, template) {
  configCatClient.getValue("marsMailer", false, async (value) => {
    if (value) {
      try {
        await nodemailer.createTestAccount(async () => {
          const transporter = await nodemailer.createTransport({
            service: "SendGrid",
            auth: {
              user: process.env.SENDGRID_USERNAME,
              pass: process.env.SENDGRID_PASSWORD,
            },
          });

          const email = new Email({
            transport: transporter,
            send: true,
            preview: false,
          });

          if (template === "passwordUpdate") {
            await email
              .send({
                template: template,
                message: {
                  from: `Movies Mars <${process.env.SENDGRID_EMAIL}>`,
                  to: `${user_email}`,
                },
                locals: {
                  name: `${name}`,
                  ip: `${data.ip}`,
                  when: `${moment.utc(data.created_at)}`,
                  where: `${data.location} at ${data.city},${data.region},${data.country}`,
                  device: `${data.device}`,
                },
              })
              .then(() => console.log("Password Changed Email Sent!"));
          } else {
            await email
              .send({
                template: template,
                message: {
                  from: `Movies Mars <${process.env.SENDGRID_EMAIL}>`,
                  to: `${user_email}`,
                },
                locals: {
                  title: "Greetings",
                  name: `${name}`,
                  verificationCode: `${data}`,
                },
              })
              .then(() => console.log("Email Sent!"));
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("\nMailer Is Disabled So mail won't Be Sent \n");
    }
  });
}
exports.mailer = mailer;
