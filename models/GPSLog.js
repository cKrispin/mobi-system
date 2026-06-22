import mongoose from "mongoose";

const gpsLogSchema = new mongoose.Schema({

    userId:{

        type:String,

        required:true

    },

    latitude:{

        type:Number,

        required:true

    },

    longitude:{

        type:Number,

        required:true

    },

    speed:{

        type:Number,

        default:0

    },

    timestamp:{

        type:Date,

        default:Date.now

    }

});

export default mongoose.model(

    "GPSLog",

    gpsLogSchema

);