const { generateOtp, getUserByUserEmail, createUser, updateUser } = require("./user.services");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");



module.exports = {
    generateOtp: (req, res) => {
        const body = req.body;
        return res.status(200).json({
            success: 1,
            message: "Successfully generate OTP"
        })
    },
    verifyOtp: (req, res) => {
        const body = req.body;
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
                results.pin = undefined;
                const jsontoken = sign({result: results}, "qwe1234", {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                    success: 1,
                    message: "Successfully verify OTP",
                    token: jsontoken
                })
            });
        });
    },
    setPin: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.pin = hashSync(body.pin, salt);
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
    }
}