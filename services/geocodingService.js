export async function geocodePlace(place){

const response = await fetch(

`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,

{

headers:{

"User-Agent":

"KinshasaTransportBeta/1.0",

"Accept":

"application/json"

}

}

);

if(!response.ok){

throw new Error(

`Geocoding failed: ${response.status}`

);

}

const data = await response.json();

if(!data.length){

throw new Error(

`Location not found: ${place}`

);

}

return{

lat:Number(data[0].lat),

lng:Number(data[0].lon)

};

}