import mongoose from "mongoose";

const tripSchema =
new mongoose.Schema({

 origin:String,

 destination:String,

 distance:Number,

 eta:Number,

 route:Array,

 createdAt:{

   type:Date,

   default:Date.now

 }

});

export default mongoose.model(
 "Trip",
 tripSchema
);