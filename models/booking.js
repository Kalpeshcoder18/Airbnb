const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  totalPrice: Number
});

module.exports = mongoose.model('Booking', bookingSchema);
