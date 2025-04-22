const jwt =require('jsonwebtoken')

const userAuth=async(req,res,next)=>{
    const {token} =req.cookies
    if(!token){
        return res.json({success:false,message:"Login Again"})
    }
    try {
      const tokenDecode=  jwt.verify(token,process.env.JWT_SECRET_KEY)

      if(tokenDecode.id){
        req.body.userId=tokenDecode.id
       
      }else{
        return res.json({success:false,message:"Not Authorised. Login Again"})
      }

      next();
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
module.exports=userAuth