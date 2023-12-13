const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utils/encryption');

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  license_no: {
    type: String,
    unique: true,
  },
  age: Number,
  dob: Date,
  car_details: {
    maker: String,
    model: String,
    year: String,
    plat_no: String
  },

  username: {
    type: String,
    unique: true,
  },
  password: String,
  user_type: {
    type: String,
    enum: ['Driver', 'Examiner', 'Admin'],
    default: 'Driver',
  },

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },

  test_type: {
    type: String,
    enum: ['G2', 'G'],
  },

  test_result: {
    type: String,
    enum: ['Pass', 'Fail'],
  },

  test_comment: String,
});

userSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 8, (err, hash) => {
    if (!this.isModified('password')) return next();

    if (err) return next(err);

    this.password = hash;

    return next();
  });
});

userSchema.pre('findOneAndUpdate', function (next) {
  if (!this._update.license_no) return next();

  const encryptedNo = encrypt(this._update.license_no || '');

  this._update.license_no = encryptedNo;

  return next();
});

userSchema.post('findOne', function (docs, next) {
  if (!docs) return next();

  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      doc.license_no = decrypt(doc?.license_no || '');
    });
  } else {
    docs.license_no = decrypt(docs?.license_no || '');
  }
  next();
});

module.exports = mongoose.model('user', userSchema);
