import TrafficAlert
from "../models/TrafficAlert.js";

export async function calculateTrafficRisk(){

try{

const highAlerts =
await TrafficAlert.countDocuments({

severity:"high"

});

if(highAlerts >= 3){

return{

risk:"HIGH",

message:
"Avoid roads with severe congestion"

};

}

if(highAlerts >=1){

return{

risk:"MEDIUM",

message:
"Some congestion detected"

};

}

return{

risk:"LOW",

message:
"Traffic conditions normal"

};

}

catch(error){

throw new Error(

"Traffic calculation failed"

);

}

}