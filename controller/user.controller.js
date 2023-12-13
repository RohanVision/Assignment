const appointmentModel = require("../models/appointment.model");
const UserModel = require("../models/user.model");
const nodemailer = require("nodemailer");

module.exports = {
  store: async (req, res) => {
    const { userId } = req.session;

    const exists = await UserModel.findOne({ license_no: req.body.license_no });

    if (exists) {
      return res.render("G2_page", {
        error: "License no already exists, please check your number!",
      });
    }

    UserModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        firstname: req.body.first_name,
        lastname: req.body.last_name,
        email: req.body.email,
        license_no: req.body.license_no,
        age: req.body.age,
        dob: req.body.dob,
        car_details: {
          maker: req.body.maker,
          model: req.body.model,
          year: req.body.year,
          plat_no: req.body.plat_no,
        },
      },
      { new: true }
    )
      .then(async result => {
        const appointmentData = await appointmentModel.findOne({
          date: req.body.date,
          time: req.body.time,
        });

        appointmentData.isTimeSlotAvailable = false;

        await appointmentData.save();

        result.appointment = appointmentData._id;

        await result.save();

        // nodemailer config
        const transporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS, // vdpc uxxi vzrn upzp
          },
        });
        const option = {
          from: process.env.EMAIL,
          to: req.body.email,
          subject: process.env.SUBJECT,
          text: process.env.BODY + req.body.date + " " + req.body.time,
        };
        transporter.sendMail(option, (error, info) => {
          if (error) {
            console.log("Error sending email", error);
          } else {
            console.log("Email sent", info);
          }
        });

        return res.redirect("/G_page");
      })
      .catch(err => {
        console.log(err);
        return res.render("G2_page", {
          error: "License no already exists, please check your number!",
        });
      });
  },

  get: (req, res) => {
    UserModel.findOne({ license_no: req.body.license_no })
      .then(result => {
        return res.render("g_page", { user: result });
      })
      .catch(err => {
        console.log(err);
      });
  },

  update: (req, res) => {
    UserModel.findOneAndUpdate(
      { license_no: req.body.license_no },
      {
        car_details: {
          maker: req.body.maker,
          model: req.body.model,
          year: req.body.year,
          plat_no: req.body.plat_no,
        },
      }
    )
      .then(result => {
        return res.redirect("/G_page");
      })
      .catch(err => {
        console.log(err);
      });
  },

  renderGPage: (req, res) => {
    const { userId } = req.session;

    UserModel.findById(userId)
      .then(result => {
        if (result.license_no) {
          return res.render("g_page", { user: result });
        } else {
          return res.redirect("/G2_page");
        }
      })
      .catch(err => {
        return res.render("g_page", { user: null });
      });
  },

  renderG2Page: (req, res) => {
    const { userId } = req.session;

    UserModel.findById(userId)
      .then(result => {
        return res.render("g2_page", { user: result });
      })
      .catch(err => {
        return res.render("g2_page", { user: null });
      });
  },

  renderExaminerPage: (req, res) => {
    const { userId } = req.session;

    UserModel.findById(userId)
      .then(result => {
        const staticArray = [
          {
            _id: "qweqwwwewqeqw",
            firstname: "XYZ",
            lastname: "abc",
            year: 2023,
            plat_no: "HUI007",
            model: "X7",
            testType: "G",
            notes: "hello note",
            status: "Pass",
          },
          {
            _id: "kjhkjhkj",
            firstname: "jkl",
            lastname: "qwert",
            year: 2020,
            plat_no: "BY2022",
            model: "GT",
            testType: "G2",
            notes: "note frm second user",
            status: "Fail",
          },
        ];
        return res.render("examiner", { driverList: staticArray });
      })
      .catch(err => {
        return res.render("examiner", { driverList: [] });
      });
  },
};