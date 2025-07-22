const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

// GET: Trip Details (From search result click)
router.get('/checkout/:id', isLoggedIn, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.redirect('/listings');

  const { checkIn, checkOut, guests } = req.query;
  if (!checkIn || !checkOut || !guests) return res.redirect(`/listings/${req.params.id}`);

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) return res.redirect(`/listings/${req.params.id}`);

  const totalPrice = listing.price * nights;

  req.session.booking = {
    listingId: listing._id,
    checkIn,
    checkOut,
    guests: parseInt(guests),
    totalPrice
  };

  res.redirect('/bookings/confirm');
}));

// POST: Trip Details (From “Reserve” on listing show page)
router.post('/checkout/:id', isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;
  const listing = await Listing.findById(id);
  if (!listing || !checkIn || !checkOut || !guests) return res.redirect(`/listings/${id}`);

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) return res.redirect(`/listings/${id}`);

  const totalPrice = listing.price * nights;

  req.session.booking = {
    listingId: listing._id,
    checkIn,
    checkOut,
    guests: parseInt(guests),
    totalPrice
  };

  res.redirect('/bookings/confirm');
}));

// GET: Confirmation Page
router.get('/confirm', isLoggedIn, wrapAsync(async (req, res) => {
  const booking = req.session.booking;
  if (!booking) return res.redirect('/');

  const listing = await Listing.findById(booking.listingId);
  if (!listing) return res.redirect('/');

  const tax = Math.round(booking.totalPrice * 0.12);
  const total = booking.totalPrice + tax;

  res.render('bookings/confirm', {
    booking,
    listing,
    tax,
    total
  });
}));

// POST: Confirm and Save Booking
router.post('/confirm', isLoggedIn, wrapAsync(async (req, res) => {
  const bookingData = req.session.booking;
  if (!bookingData) return res.status(400).send("Booking session expired.");

  const booking = new Booking({
    listing: bookingData.listingId,
    user: req.user._id,
    checkIn: new Date(bookingData.checkIn),
    checkOut: new Date(bookingData.checkOut),
    guests: bookingData.guests,
    totalPrice: bookingData.totalPrice,
    paymentMethod: req.body.method || "UPI"
  });

  await booking.save();

  req.session.bookingId = booking._id;
  req.session.booking = null;

  res.redirect('/bookings/bill');
}));

// GET: Fake Payment UI
router.get('/payment', isLoggedIn, (req, res) => {
  const booking = req.session.booking;
  if (!booking) return res.redirect('/');
  res.render('bookings/payment', { booking });
});

// GET: Final Bill Page
router.get('/bill', isLoggedIn, wrapAsync(async (req, res) => {
  const bookingId = req.session.bookingId;
  if (!bookingId) return res.redirect('/listings');

  const booking = await Booking.findById(bookingId).populate('listing');
  req.session.bookingId = null; // Clear for safety

  res.render('bookings/bill', { booking });
}));

module.exports = router;
