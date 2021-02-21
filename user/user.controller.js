const { generateOtp } = require("./user.services");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

module.exports = {
    generateOtp: (req, res) => {
        const body = req.body;
        return res.status(200).json({
            success: 0,
            message: "Successfully generate OTP"
        })
    },
    verifyOtp: (req, res) => {
        const body = req.body;
        return res.status(200).json({
            success: 0,
            message: "Successfully verify OTP"
        })
    }
}