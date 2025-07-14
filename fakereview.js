const mongoose = require('mongoose');
const Listing = require('./models/listing');
const Review = require('./models/review');
const User = require('./models/user');

// Replace with your DB name
mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
  .then(() => console.log("DB Connected ✅"))
  .catch(err => console.error("DB Error ❌", err));

const sampleComments = [
  "Fantastic location and very clean!",
  "Would definitely recommend this place.",
  "The host was super friendly.",
  "Comfortable beds and amazing view!",
  "Close to shops and restaurants.",
  "Great value for the price!"
];

const sampleRatings = [5, 4, 5, 4, 3, 5];

async function seedReviews() {
  const listings = await Listing.find({});
  const users = await User.find({});

  if (users.length === 0) {
    console.log("⚠️ No users found. Please create users first.");
    return;
  }

  for (let listing of listings) {
    // Optional: Clear old reviews first
    listing.reviews = [];

    for (let i = 0; i < 6; i++) {
      const review = new Review({
        comment: sampleComments[i],
        rating: sampleRatings[i],
        author: users[Math.floor(Math.random() * users.length)]._id
      });

      await review.save();
      listing.reviews.push(review._id);
    }

    await listing.save();
    console.log(`✅ Added 6 reviews to listing: ${listing.title}`);
  }

  mongoose.connection.close();
}

seedReviews();
