const Listing=require("../models/listing");
//  https://github.com/mapbox/mapbox-sdk-js
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
}

module.exports.renderNewForm=(req,res)=>{
 res.render("listings/new");
}

module.exports.showListing=async(req,res)=>{
    const id=req.params.id;
    const listing=await 
    Listing.findById(id)
    .populate({path:"reviews",populate:{//nested populate
        path:"author",
    },
})
    .populate("owner");
    if(!listing) {
       req.flash("error","Listing you try to access does not exist <**>");
       res.redirect("/listings") ;
    }
    res.render("listings/show",{listing});

}

module.exports.createListing=async(req,res,next)=>{
    //let {title,description,image,price,country,location}=req.body;
let response =await geocodingClient.forwardGeocode({
  query:req.body.listing.location,
  limit: 1  
})
  .send();
let url=req.file.path;
let filename=req.file.filename;

const newListing=new Listing(req.body.listing);
newListing.owner=req.user._id;
newListing.image={url,filename};
newListing.geometry=response.body.features[0].geometry;
let saveListing=await newListing.save();
console.log(saveListing);   
req.flash("success","New Listing Created :)");
res.redirect("/listings");
}

module.exports.editForm=async(req,res)=>
    {
        const {id}=req.params;
        const listing=await Listing.findById(id);
        if(!listing){
            req.flash("error","Listing you requested for does not exist!");
            res.redirect("/listings");
        }

        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/h_100,w_250");
        res.render("listings/edit.ejs",{listing,originalImageUrl});

}

module.exports.updateForm=async(req,res)=>{
     const id=req.params.id;    
     let listing=await Listing.findByIdAndUpdate(id,req.body.listing);
    
     if(typeof req.file!=="undefined"){
     let url=req.file.path;
     let filename=req.file.filename;
     listing.image={url,filename};
     await listing.save();  
     }  
     req.flash("success"," Listing Updated :)");
     res.redirect(`/listings/${id}`);

}

module.exports.deleteForm=async(req,res)=>{
     const id=req.params.id;
     await Listing.findByIdAndDelete(id,req.body);
     req.flash("success","Listing Deleted!!");
     res.redirect("/listings");

}

module.exports.searchBox=async (req, res) => {
    const { search } = req.query;
    console.log("Search query:", search);

    let query = {};

    if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query = {
            $or: [
                { location: { $regex: regex } },
                { country: { $regex: regex } }
            ]
        };
    }

    try {
        const listings = await Listing.find(query);
        res.render('listings/index', { allListings: listings });
    } catch (err) {
        console.error(err);
        res.status(500).send("Search failed.");
    }
}