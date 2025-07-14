const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");


main().then((res)=>{
    console.log("connected to database"); 
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDb=async()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>({
      ...obj,owner:"686df8892adef974661595f5"
    }));
    await Listing.insertMany(initData.data);
    console.log("Database initialized");
}

initDb();