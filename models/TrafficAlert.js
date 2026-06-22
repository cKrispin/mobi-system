import mongoose from "mongoose";


const TrafficAlertSchema=

new mongoose.Schema({

road:{

type:String,

required:true

},

type:{

type:String,

required:true

},

description:{

type:String,

required:true

},

severity:{

type:String,

required:true

},

createdAt:{

type:Date,

default:Date.now

}

});


TrafficAlertSchema.index(

{

road:1,

type:1,

description:1,

severity:1

},

{

unique:true

}

);


export default mongoose.model(

"TrafficAlert",

TrafficAlertSchema

);