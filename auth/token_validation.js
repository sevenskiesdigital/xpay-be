const { verify } = require("jsonwebtoken") ;

module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");
        if(token){
            token = token.slice(7);
            verify(token, process.env.JWT_KEY, (err, decoded) => {
                if(err){
                    res.status(200).json({
                        success: 0,
                        message: "Invalid token"
                    })
                }else{
                    req.user = decoded.result;
                    next();
                }
            }) 
        }else{
            res.status(200).json({
                success: 0,
                message: "Access Denied! unauthorized user"
            })
        }
    },
    checkOTP: (req, res, next) => {
        let token = req.get("authorization");
        if(token){
            token = token.slice(7);
            verify(token, process.env.JWT_KEY, (err, decoded) => {
                if(err){
                    res.status(200).json({
                        success: 0,
                        message: "Invalid token"
                    })
                }else{
                    req.user = decoded.result;
                    next();
                }
            }) 
        }else{
            res.status(200).json({
                success: 0,
                message: "Access Denied! unauthorized user"
            })
        }
    }
}
