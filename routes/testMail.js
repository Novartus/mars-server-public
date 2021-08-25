require("dotenv").config();
const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const chalk = require("chalk");
const GraphQLClient = require("@testmail.app/graphql-request").GraphQLClient;
const testMailClient = new GraphQLClient(
  // API endpoint:
  "https://api.testmail.app/api/graphql",
  { headers: { Authorization: `${process.env.TEST_MAIL_HEADER}` } }
);
// Middleware
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
// Models
const { Inquiry } = require("../models/inquiry");
const { InquiryAttachment } = require("../models/inquiryAttachment");
const { User } = require("../models/user");
// Constant Message Responses
const RESPONSE_CODE = require("../constants/responseCode");

const query = `{
  inbox (
    namespace: "${process.env.TEST_MAIL_NAMESPACE}"
    advanced_sorts:[ {
      field:timestamp,
      order:desc
    }]
  ) {
    result
    message
    count
    emails{
        id
        tag
        timestamp
        date
        from
        subject
        from_parsed{
            address
            name
        }
        text
        attachments{
            filename
            checksum
            size
            contentType
            downloadUrl
        }
        downloadUrl
    }
  }
}`;

// It will be used to get all emails and store them in DB
// cron.schedule("* * * * *", async () => {
// Every 1 Min
cron.schedule("*/30 * * * *", async () => {
  // Every 30 Mins
  console.log(chalk.bgRed.black("Running Cron Job, Fetching TestMail.APP"));
  try {
    const data = await testMailClient.request(query);
    const totalEmails = data.inbox.count;
    const emails = data.inbox.emails;
    let count = 0;

    for (let i = 0; i < totalEmails; i++) {
      const emailData = await Inquiry.findOne({
        where: { test_mail_id: emails[i].id },
      });

      if (!emailData) {
        const user = User.findOne({
          where: {
            email: emails[i].from_parsed[0].address,
          },
        });

        count++;

        const inquiryEmailData = await Inquiry.create({
          test_mail_id: emails[i].id,
          user_id: user.id,
          from_address: emails[i].from_parsed[0].address,
          from_name: emails[i].from_parsed[0].name,
          tag: emails[i].tag,
          subject: emails[i].subject,
          text: emails[i].text,
          has_attachments: emails[i].attachments.length > 0 ? true : false,
          download_url: emails[i].downloadUrl,
          timestamp: emails[i].timestamp,
          date: emails[i].date,
        });
        if (inquiryEmailData.has_attachments) {
          const totalAttachments = emails[i].attachments.length;
          for (let j = 0; j < totalAttachments; j++) {
            await InquiryAttachment.create({
              inquiry_id: inquiryEmailData.id,
              test_mail_id: inquiryEmailData.test_mail_id,
              user_id: user.id,
              filename: emails[i].attachments[j].filename,
              checksum: emails[i].attachments[j].checksum,
              size: emails[i].attachments[j].size,
              content_type: emails[i].attachments[j].contentType,
              download_url: emails[i].attachments[j].downloadUrl,
            });
          }
        }
      } else {
        // If email-Id found then entry is already created.
        // Because we will get data in DESC order according to date
        break;
      }
    }
    console.log(chalk.bgGreen.black("New Emails:", count));
  } catch (error) {
    console.log("Error", error);
  }
});

router.get("/view", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const data = await testMailClient.request(query);
    return res
      .status(RESPONSE_CODE.OK)
      .send({ count: data.inbox.count, emails: data.inbox.emails });
  } catch (error) {
    return res.status(RESPONSE_CODE.BAD_REQUEST).send(error);
  }
});

// Get Emails From TestMail.APP and save it to DB
router.get(
  "/save/emails",
  authenticateToken,
  isAdmin,
  async (req, res, next) => {
    try {
      const data = await testMailClient.request(query);
      const totalEmails = data.inbox.count;
      const emails = data.inbox.emails;

      for (let i = 0; i < totalEmails; i++) {
        const emailData = await Inquiry.findOne({
          where: { test_mail_id: emails[i].id },
        });

        if (!emailData) {
          const user = User.findOne({
            where: {
              email: emails[i].from_parsed[0].address,
            },
          });

          const inquiryEmailData = await Inquiry.create({
            test_mail_id: emails[i].id,
            user_id: user.id,
            from_address: emails[i].from_parsed[0].address,
            from_name: emails[i].from_parsed[0].name,
            tag: emails[i].tag,
            subject: emails[i].subject,
            text: emails[i].text,
            has_attachments: emails[i].attachments.length > 0 ? true : false,
            download_url: emails[i].downloadUrl,
            timestamp: emails[i].timestamp,
            date: emails[i].date,
          });
          if (inquiryEmailData.has_attachments) {
            const totalAttachments = emails[i].attachments.length;
            for (let j = 0; j < totalAttachments; j++) {
              await InquiryAttachment.create({
                inquiry_id: inquiryEmailData.id,
                test_mail_id: inquiryEmailData.test_mail_id,
                user_id: user.id,
                filename: emails[i].attachments[j].filename,
                checksum: emails[i].attachments[j].checksum,
                size: emails[i].attachments[j].size,
                content_type: emails[i].attachments[j].contentType,
                download_url: emails[i].attachments[j].downloadUrl,
              });
            }
          }
        } else {
          // If email-Id found then entry is already created.
          // Because we will get data in DESC order according to date
          break;
        }
      }
      return res
        .status(RESPONSE_CODE.OK)
        .send({ count: data.inbox.count, success: true });
    } catch (error) {
      console.log("Error", error);
      return res.status(RESPONSE_CODE.BAD_REQUEST).send(error);
    }
  }
);

router.get(
  "/inquiry/messages",
  authenticateToken,
  isAdmin,
  async (req, res, next) => {
    const inquiry = await Inquiry.findAll({});
    let data = [];

    for (let i = 0; i < inquiry.length; i++) {
      data.push({
        id: inquiry[i].id,
        test_mail_id: inquiry[i].test_mail_id,
        from_address: inquiry[i].from_address,
        from_name: inquiry[i].from_name,
        tag: inquiry[i].tag,
        subject: inquiry[i].subject,
        text: inquiry[i].text,
        timestamp: inquiry[i].timestamp,
      });
    }
    return res.status(RESPONSE_CODE.OK).send({ emails: data, success: true });
  }
);
module.exports = router;
