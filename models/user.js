const { required } = require("joi");
const mongoose=require("mongoose"); 
const Schema =mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    }
});

//passport-local-mongoose humare schema me username and passport automatically
//declare kar deta hai ,chahe hum usee declare kare ya nahi

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);
