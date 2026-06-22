import User from "../models/User.js";

export async function getUsers(req,res){


try{

	const users = await User.find().select("-password");

	res.json({

		success:true,

		count:users.length,

		users

	});

}

catch(error){

	res.status(500).json({

		success:false,

		error:error.message

	});

}


}
