const { generateOtp, verifyOtp, getUserByUserEmail, createUser, updateUser } = require("./user.services");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");



module.exports = {
    generateOtp: (req, res) => {
        const body = req.body;
        var string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let OTP = '';
        
        // Find the length of string
        var len = string.length;
        for (let i = 0; i < 4; i++ ) {
            OTP += string[Math.floor(Math.random() * len)];
        }        
        body.otp = OTP;
        body.expires_in = new Date(Date.now() + process.env.OTP_EXPIRED_IN_MINUTES*60000);

        generateOtp(body, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully generate OTP",
                otp: OTP
            })
        });

    },
    verifyOtp: (req, res) => {
        const body = req.body;
        body.expires_in = new Date(Date.now());
        
        verifyOtp(body, (err, results) => {
            if(err || results.length == 0){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Failed verify OTP"
                });
            }
            createUser(body, (err, results) => {
                if(err){
                    console.log(err);
                    if(err.code !== "ER_DUP_ENTRY"){
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        })
                    }
                } 
                getUserByUserEmail(body.email, (err, results) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        })
                    }
                    const pin = results.pin;
                    results.pin = undefined;
                    const jsontoken = sign({result: results}, process.env.JWT_KEY, {
                        expiresIn: process.env.JWT_EXPIRED
                    });
                    return res.status(200).json({
                        success: 1,
                        message: "Successfully verify OTP",
                        token: jsontoken,
                        pin: pin?1:0
                    })
                });
            });
        });        
    },
    setPin: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.pin = hashSync(body.pin, salt);
        body.id = req.user.id;
        updateUser(body, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Update successfully"
            })
        });
    },
    verifyPin: (req, res) => {
        const body = req.body;
        
        getUserByUserEmail(body.email, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            const pin = results.pin;
            if(compareSync(body.pin, pin)){
                return res.status(200).json({
                    success: 1,
                    message: "Successfully verify PIN",
                    pin: pin?1:0
                })
            } else {
                return res.status(200).json({
                    success: 1,
                    message: "Failed verify PIN",
                    pin: pin?1:0
                })
            }
            
        });        
    }
}