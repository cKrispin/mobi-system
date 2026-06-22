import GPSLog from "../models/GPSLog.js";

export async function saveGPS(req,res){

try{

const{

userId,
latitude,
longitude,
speed

}=req.body;

const gps= await GPSLog.create({

userId,
latitude,
longitude,
speed

});

res.json({

    success:true,

    message:"GPS Saved",

    data:gps

});

}

catch(error){

res.status(500).json({

success:false,

error:error.message

});

}

}