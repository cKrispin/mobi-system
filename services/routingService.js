import axios from "axios";

export async function getRoute(

    startLat,
    startLng,
    endLat,
    endLng

){

    try{

        const url =
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

        const response =
        await axios.get(url);

        if(

            !response.data.routes ||

            response.data.routes.length === 0

        ){

            throw new Error(
                "No route found"
            );

        }

        const route =
        response.data.routes[0];

        return{

        distance:

        Number(

        (route.distance/1000)

        .toFixed(2)

        ),

        eta:

        Number(

        (route.duration/60)

        .toFixed(0)

        ),

        geometry:

        route.geometry,

        routeFound:true

        };

    }

    catch(error){

        console.error(
            "Routing Error:",
            error.message
        );

        throw new Error(

            "Unable to calculate route"

        );

    }

}