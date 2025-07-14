const Listing=require("./models/listing");
const ExpressError=require("./utils/expressError.js");
const Review=require("./models/review.js");
const {listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
        if(!req.isAuthenticated()){
        //we use redirectUrl for redirect the user to page where he want &logged in
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create listing !!");    
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
        if(req.session.redirectUrl){
            res.locals.redirectUrl=req.session.redirectUrl;

    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
     const id=req.params.id;
     let listing=await Listing.findById(id);
     if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have access to edit listing");
        return res.redirect(`/listings/${id}`);
     }
    next();
}

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);//by using joi
// if(result.error){
//     return res.status(400).send(result.error.details[0].message);
// }
if(error){
    throw new ExpressError(400,error);
}else{
    next();
}
}

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);//by using joi
// if(result.error){
//     return res.status(400).send(result.error.details[0].message);
// }
if(error){
    throw new ExpressError(400,error);
}else{
    next();
}
}

module.exports.isReviewAuthor=async(req,res,next)=>{
     const {id,reviewId}=req.params;
     let review=await Review.findById(reviewId);
     if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You did not create this review!!");  
        return res.redirect(`/listings/${id}`);
     }
    next();
}
