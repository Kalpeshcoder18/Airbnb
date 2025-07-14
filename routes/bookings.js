const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateReview,isReviewAuthor}=require("../middleware.js");

// User submits Reserve → store in session
router.post('/checkout/:id',isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;
  const listing = await Listing.findById(id);

  const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  const totalPrice = listing.price * nights;


  req.session.booking = {
    listingId: id,
    checkIn,
    checkOut,
    guests,
    totalPrice
  };

  res.redirect('/bookings/confirm');
});

//Show trip summary + total price before payment
router.get('/confirm',isLoggedIn, async (req, res) => {
  const booking = req.session.booking;
  if (!booking) return res.redirect('/'); // safety check

  const listing = await Listing.findById(booking.listingId);

  const tax = Math.round(booking.totalPrice * 0.12);
  const total = booking.totalPrice + tax;

  res.render('bookings/confirm', {
    booking,
    listing,
    tax,
    total
  });
});

//  Show fake payment UI
router.get('/payment',isLoggedIn, (req, res) => {
  const booking = req.session.booking;
  if (!booking) return res.redirect('/');
  res.render('bookings/payment', { booking });
});


router.post('/confirm',isLoggedIn, async (req, res) => {
  const bookingData = req.session.booking;

  if (!bookingData) {
    return res.status(400).send("Booking session expired. Please start again.");
  }

  const booking = new Booking({
    listing: bookingData.listingId,
    user: req.user._id,
    checkIn: bookingData.checkIn,
    checkOut: bookingData.checkOut,
    guests: bookingData.guests,
    totalPrice: bookingData.totalPrice,
    paymentMethod: req.body.method || "Unknown"
  });

  await booking.save();

  req.session.bookingId = booking._id;
  req.session.booking = null;

  res.redirect('/bookings/bill');
});



// Final bill page
router.get('/bill',isLoggedIn, async (req, res) => {
  const bookingId = req.session.bookingId;
  if (!bookingId) return res.redirect('/'); // or show error

  const booking = await Booking.findById(bookingId).populate('listing');
  req.session.bookingId = null; // optional: clear after use

  res.render('bookings/bill', { booking });
});

module.exports = router;
