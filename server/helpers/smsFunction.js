const { Student } = require("../model");

const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSms = async (id, phone, message) => {
  try {
    const student_id = await Student.findByPk(id);

    if (!student_id) {
      return "Student not found";
    }

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_NUMBER,
      to: `+233${phone}`,
    });
    return sms;
  } catch (error) {
    return error;
  }
};

module.exports = sendSms;
