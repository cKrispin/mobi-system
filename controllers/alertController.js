import TrafficAlert from "../models/TrafficAlert.js";


/* ====================================== */
/* CREATE ALERT */
/* ====================================== */

export async function createAlert(req,res){

try{

let{ 
    road, 
    type,
    description,
    severity

}=req.body;


/* normalize */

road=

String(

road||""

)

.trim();

type=

String(

type||""

)

.trim();

description=

String(

description||""

)

.trim();

severity=

String(

severity||""

)

.trim();


if(

!road ||

!type ||

!description ||

!severity

){

return res.status(400).json({

success:false,

error:"Missing Fields"

});

}


/* prevent spam duplicates */

const existing=

await TrafficAlert.findOne({

road,

createdAt:{

$gte:

new Date(

Date.now()-60000

)

}

});


if(existing){

return res.json({

success:true,

message:"Alert already exists recently"

});

}


/* create */

const alert=

await TrafficAlert.create({

road,
type,
description,
severity

});


return res.json({

success:true,

alert

});

}

catch(error){

console.log(

"CREATE ALERT ERROR:",

error

);

return res.status(500).json({

success:false,

error:error.message

});

}

}



/* ====================================== */
/* GET ALERTS */
/* ====================================== */

export async function getAlerts(

req,
res

){

try{

const alerts=

await TrafficAlert.aggregate([

{

$match:{

road:{

$nin:["",null]

},

type:{

$nin:["",null]

},

description:{

$nin:["",null]

},

severity:{

$nin:["",null]

}

}

},

{

$sort:{

createdAt:-1

}

},

{

$group:{

_id:{

road:"$road",

type:"$type",

description:"$description",

severity:"$severity"

},

alert:{

$first:"$$ROOT"

}

}

},

{

$replaceRoot:{

newRoot:"$alert"

}

},

{

$limit:100

}

]);


return res.json({

success:true,

count:alerts.length,

alerts

});

}

catch(error){

return res.status(500).json({

success:false,

error:error.message

});

}

}



/* ====================================== */
/* TRAFFIC SUMMARY */
/* ====================================== */

export async function trafficSummary(

req,
res

){

try{

const total=

await TrafficAlert.countDocuments();

const high=

await TrafficAlert.countDocuments({

severity:"high"

});

const medium=

await TrafficAlert.countDocuments({

severity:"medium"

});

const low=

await TrafficAlert.countDocuments({

severity:"low"

});


return res.json({

success:true,

summary:{

totalAlerts:total,

high,

medium,

low

}

});

}

catch(error){

console.log(

"SUMMARY ERROR:",

error

);

return res.status(500).json({

success:false,

error:error.message

});

}

}