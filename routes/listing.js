const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage })

//index routes
router.get("/",wrapAsync(listingController.index));

//new route 
router.get("/new",isLoggedIn,listingController.renderNewForm);

// Search route
router.get('/search',listingController.searchBox );



//show route
router.get("/:id",wrapAsync(listingController.showListing));

//create route
router.post("/",isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editForm));

//update route
router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateForm));

router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteForm));



module.exports=router;