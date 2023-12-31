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
        test_type: "G2"
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
    const { userId } = req.session;

    UserModel.findOneAndUpdate(
      { _id: userId, },
      {
        car_details: {
          maker: req.body.maker,
          model: req.body.model,
          year: req.body.year,
          plat_no: req.body.plat_no,
        },
        test_type: "G",
      },
      { new: true }
    )
      .then(async (result) => {
        const appointmentData = await appointmentModel.findOne({
          date: req.body.date,
          time: req.body.time,
        });

        appointmentData.isTimeSlotAvailable = false;

        await appointmentData.save();

        result.appointment = appointmentData._id;

        await result.save();

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
    const testType = req.query.testType;

    const query = {};

    if (testType) {
      query.test_type = testType;
    }

    UserModel.find({
      _id: {
        $ne: userId,
      },
      appointment: {
        $ne: null,
      },
      ...query,
    })
      .then(result => {
        const list = result.map(item => ({
          _id: item._id,
          firstname: item.firstname,
          lastname: item.lastname,
          year: item.car_details.year,
          plat_no: item.car_details.plat_no,
          model: item.car_details.model,
          testType: item.test_type,
          email: item.email,
          username: item.username,
          dob: item.dob,
          license_no: item.license_no,
          appointment: item.appointment,
          test_result: item.test_result,
          test_comment: item.test_comment,
        }));

        return res.render("examiner", { driverList: list });
      })
      .catch(err => {
        console.log(err);
        return res.render("examiner", { driverList: [] });
      });
  },

  updateResult: (req, res) => {
    UserModel.findOneAndUpdate(
      {
        _id: req.body.driverId,
      },
      {
        test_result: req.body.result,
        test_comment: req.body.notes,
      },
      { new: true }
    )
      .then(result => {
        return res.redirect("/examiner");
      })
      .catch(err => {
        console.log(err);
        return res.redirect("/examiner");
      });
  },
};