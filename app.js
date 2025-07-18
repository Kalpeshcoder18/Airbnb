if(process.env.NODE_ENV!="production"){
require('dotenv').config()
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/expressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js"); 
const chatRoutes = require("./routes/chats");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const bookingRouter=require("./routes/bookings.js");

const dbUrl=process.env.ATLASDB_URL;
main().then(()=>{
    console.log("connected to database"); 
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
 


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("error in MONGO-SESSION store",err);
})

const sessionOptions={
    store,
    secret: process.env.SECRET,//kuch acha secret likhna
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true

    }
};

app.get("/", (req, res) => {
  res.redirect("/listings");
});




app.use(session(sessionOptions));
app.use(flash());   //inhe routers se pehle declare karne  hai

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash using locals
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    //locals we use to directly access the res.user or else in ejs file...very imp
    //ise humne navbar.ejs me use kiya hai
    next();
});




//use to join with routers
app.use("/listings",listingRouter);
//note: this gives as a en error ,yha id ko server nahi samaj sakta 
//more :reads doc of express routers , isiliye router me mergeParams:true karte haii
app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);
app.use("/bookings",bookingRouter);
app.use(express.json());

app.use("/", chatRoutes);

// app.all("*", (req, res, next) => {

//     next( ExpressError(404, "page not found"));  
// });
    

//server side ke error
app.use((err,req,res,next)=>{
     let { statusCode = 500, message = "Something went wrong" } = err;
     res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
})

try {
    // all app.use, app.get, etc.

    app.listen(8080, () => {
        console.log("server running on 8080");
    });
} catch (err) {
    console.log("Startup error:", err);
}
  