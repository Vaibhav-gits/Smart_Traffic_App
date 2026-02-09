const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

const sendSMS = async (phone, message) => {
  if (!client) {
    console.log("Twilio not configured, skipping SMS");
    return;
  }
  try {
    const msg = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });
    console.log("SMS sent:", msg.sid);
  } catch (error) {
    console.error("SMS send error:", error);
    throw error;
  }
};

module.exports = sendSMS;
