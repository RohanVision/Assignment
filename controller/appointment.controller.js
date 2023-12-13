const appointmentModel = require("../models/appointment.model");
const userModel = require("../models/user.model");

module.exports = {
  renderAppointments: async (req, res) => {

    const result = await userModel.find({
      appointment: {
        $ne: null,
      },
    })

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

    res.render('appointment', { driverList: list });
  },

  store: async (req, res) => {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.render('appointment', {
        error: "Please select date and time!",
      });
    }

    const slot = await appointmentModel.findOne({ date, time });

    if (slot) {
      return res.render('appointment', {
        error: "Slot is already added! Please select another slot",
      });
    }

    await appointmentModel.create({
      date,
      time,
      isTimeSlotAvailable: true,
    });

    return res.redirect('/appointment');
  },

  getSlots: async (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.send({
        error: "Please select date!",
      });
    }

    const slots = await appointmentModel.find({ date });

    return res.json(slots);
  }
};
