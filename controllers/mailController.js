const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const sendDelEmail = async (req, res) => {
  const { garageId, email, date, hour, minute } = req.body;
  // console.log(req.body);
  if (garageId && email) {
    send();

    async function send() {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "17astudio@gmail.com",
          pass: "bixa ucqx wjxs lsue",
        },
      });
      const result = await transporter.sendMail({
        from: "WarsztApp",
        to: email,
        subject: "anulowano wizytę w warsztacie",
        text: `Anulowano Twoją wizytę w ${garageId} w dniu: ${date} o godzinie ${hour}:${minute}. `,
      });
    }
    res.json({ message: "sent" });
  }
};

const sendEmail = async (req, res) => {
  console.log(req.body);
  let link = "";
  const {
    garageId,
    email,
    date,
    hour,
    minute,
    user,
    notes,
    author,
    authorname,
  } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "17astudio@gmail.com",
      pass: "bixa ucqx wjxs lsue",
    },
  });
  console.log(req.body);
  const confirmationToken = jwt.sign(
    {
      AppointmentInfo: {
        garageId,
        email,
        date,
        hour,
        minute,
        user,
        notes,
        author,
        authorname,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  link = `https://warszt.app/${garageId}/confirmation/${date}/${confirmationToken}`;
  send();

  async function send() {
    const result = await transporter.sendMail({
      from: "WarsztApp",
      to: email,
      subject: "umów wizytę w naszym warsztacie",
      text: `Potwierdź prośbę o wizytę w ${garageId} w dniu: ${date} o godzinie ${hour}:${minute} klikając w link: ${link}`,
    });

    console.log(JSON.stringify(result, null, 4));
  }
  res.json({ message: "sent" });
};

module.exports = { sendEmail, sendDelEmail };
