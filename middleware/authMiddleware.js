import jwt from "jsonwebtoken";

export async function protect(

req,
res,
next

){

try{

const header=

req.headers.authorization;

if(

!header ||

!header.startsWith(

"Bearer "

)

){

return res.status(401).json({

success:false,

error:"Unauthorized"

});

}

const token=

header.split(

" "

)[1];

const decoded=

jwt.verify(

token,

process.env.JWT_SECRET

);

req.user={

id:decoded.id,

role:decoded.role

};

next();

}

catch(error){

return res.status(401).json({

success:false,

error:"Invalid Token"

});

}

}