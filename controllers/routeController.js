import { getRoute } from "../services/routingService.js";
import Trip from "../models/Trip.js";
import { calculateTrafficRisk } from "../services/trafficService.js";
import { geocodePlace } from "../services/geocodingService.js";


export async function recommendRoute(req, res){

try{

const {

startLat,
startLng,
endLat,
endLng

}=req.body;


/* Coordinate Validation */

if(

startLat < -90 ||
startLat > 90 ||

endLat < -90 ||
endLat > 90 ||

startLng < -180 ||
startLng > 180 ||

endLng < -180 ||
endLng > 180

){

return res.status(400).json({

success:false,

error:"Invalid coordinates"

});

}


/* Get Route */

const route =
await getRoute(

startLat,
startLng,
endLat,
endLng

);


/* Save Trip */

await Trip.create({

origin:

`${startLat},${startLng}`,

destination:

`${endLat},${endLng}`,

distance:

route.distance,

eta:

route.eta,

route:

route.geometry?.coordinates || []

});


/* Return Response */

res.json({

success:true,

recommendation:{

distance:

`${route.distance} km`,

estimatedTime:

`${route.eta} mins`,

origin:{

lat:startLat,

lng:startLng

},

destination:{

lat:endLat,

lng:endLng

},

geometry:

route.geometry,

message:

"Recommended route found"

}

});

}

catch(err){

res.status(500).json({

success:false,

error:err.message

});

}

}


export async function recommendSmartRoute(req,res){


try{

	const { startPlace, endPlace } = req.body;

	/* Validate Input */

	if(!startPlace || !endPlace){

		return res.status(400).json({

			success:false,

			error:"Veuillez renseigner le point de départ et la destination"

		});

	}

	/* Force Kinshasa Context */

	const startQuery =
	`${startPlace}, Kinshasa, RDC`;

	const endQuery =
	`${endPlace}, Kinshasa, RDC`;

	console.log(
		"ROUTE SEARCH:",
		startQuery,
		"→",
		endQuery
	);

	/* Convert Place Names To Coordinates */

	const start =
	await geocodePlace(startQuery);

	const end =
	await geocodePlace(endQuery);

	if(!start || !end){

		return res.status(404).json({

			success:false,

			error:"Lieu introuvable à Kinshasa"

		});

	}

	const startLat = start.lat;
	const startLng = start.lng;

	const endLat = end.lat;
	const endLng = end.lng;

	/* Get Route */

	const route = await getRoute(

		startLat,
		startLng,
		endLat,
		endLng

	);

	/* Calculate Traffic */

	const traffic =
	await calculateTrafficRisk();

	res.json({

		success:true,

		recommendation:{

			distance:
			`${route.distance} km`,

			estimatedTime:
			`${route.eta} mins`,

			trafficRisk:
			traffic.risk,

			trafficMessage:
			traffic.message,

			origin:{

				name:startPlace,

				lat:startLat,

				lng:startLng

			},

			destination:{

				name:endPlace,

				lat:endLat,

				lng:endLng

			},

			geometry:
			route.geometry

		}

	});

}

catch(error){

	console.error(
		"SMART ROUTE ERROR:",
		error
	);

	res.status(500).json({

		success:false,

		error:error.message

	});

}

}



//recommand smart route
// export async function recommendSmartRoute(req,res){

// 	try{

// 		const{startPlace,endPlace}=req.body;


// 		/* Convert Place Names To Coordinates */

// 		const start = await geocodePlace(startPlace);

// 		const end = await geocodePlace(endPlace);


// 		const startLat = start.lat;

// 		const startLng = start.lng;

// 		const endLat = end.lat;

// 		const endLng = end.lng;


// 		/* Get Route */

// 		const route = await getRoute(

// 			startLat,

// 			startLng,

// 			endLat,

// 			endLng

// 		);


// 		/* Calculate Traffic */

// 		const traffic = await calculateTrafficRisk();


// 		res.json({

// 			success:true,

// 			recommendation:{

// 			distance:`${route.distance} km`,

// 			estimatedTime: `${route.eta} mins`,

// 			trafficRisk: traffic.risk,

// 			trafficMessage: traffic.message,

// 			origin:{

// 				name:startPlace,

// 				lat:startLat,

// 				lng:startLng

// 			},

// 			destination:{

// 				name:endPlace,

// 				lat:endLat,

// 				lng:endLng

// 			},

// 			geometry: route.geometry

// 		}

// 		});

// 	}

// 	catch(error){

// 		res.status(500).json({

// 			success:false,

// 			error:error.message

// 		});

// 	}

// }





