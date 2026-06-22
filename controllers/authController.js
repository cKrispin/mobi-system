import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import User from "../models/User.js";


export async function register(

req,
res

){

try{

const{

name,
email,
password

}=req.body;

const exists=

await User.findOne({

email

});

if(exists){

return res.json({

success:true

});

}

const hash=

await bcrypt.hash(

password,

10

);

const user=

await User.create({

name,

email,

password:hash

});

res.json({

success:true,

userId:user._id

});

}

catch(error){

res.status(500).json({

success:false,

error:error.message

});

}

}



export async function login(

req,
res

){

try{

const{

email,
password

}=req.body;

const user=

await User.findOne({

email

});

if(!user){

return res.status(401)

.json({

success:false

});

}

const valid=

await bcrypt.compare(

password,

user.password

);

if(!valid){

return res.status(401)

.json({

success:false

});

}

const token=

jwt.sign(

{

id:user._id,

role:user.role

},

process.env.JWT_SECRET,

{

expiresIn:"30d"

}

);

res.json({

success:true,

token

});

}

catch(error){

res.status(500)

.json({

success:false,

error:error.message

});

}

}

// list of registered users
export async function getUsers(

req,
res

){

try{

const users=

await User.find()

.select(

"-password"

)

.sort({

createdAt:-1

});

res.json({

success:true,

count:

users.length,

users

});

}

catch(error){

res.status(500)

.json({

success:false,

error:

error.message

});

}

}