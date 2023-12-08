const appointmentModel = require("../models/appointment.model");

module.exports = {
  renderAppointments: (req, res) => {
    res.render('appointment');
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
