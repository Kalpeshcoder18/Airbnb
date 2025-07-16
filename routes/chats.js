// routes/chat.js
const express = require("express");
const router = express.Router();
const chatWithGemini = require("../chatbot");
const Listing = require("../models/listing");

router.post("/chatbot/:id", async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id).populate("owner reviews");

    const listingInfo = `
Title: ${listing.title}
Description: ${listing.description}
Location: ${listing.location}, ${listing.country}
Price: ₹${listing.price}
Amenities: ${listing.amenities?.join(", ") || "Not listed"}
House Rules: ${listing.houseRules || "Standard rules apply"}
Top Review: ${listing.reviews?.[0]?.comment || "No reviews yet"}
    `;

    const reply = await chatWithGemini(message, listingInfo);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error retrieving listing or chatting." });
  }
});

module.exports = router;
