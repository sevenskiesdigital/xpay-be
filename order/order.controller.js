const { createOrder, getOrderBySellerId, getOrderByCode } = require("./order.services");
const { getActivePaymentByCode } = require("../payment/payment.services");
const { sign } = require("jsonwebtoken");
const midtransClient = require('midtrans-client');

// Create Snap API instance
let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction : false,
        serverKey : 'SB-Mid-server-qug5i26hvYpNpdZDXxk735ko'
    });

function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}

module.exports = {
    createOrder: (req, res) => {
        const body = req.body;
        var order = {
            "seller_id": req.user.id,
            "buyer_id": body.buyer_id,
            "product_name": body.product_name,
            "note": body.note,
            "amount": body.amount,
            "payment_code": randomString(5, '#aA'),
            "expired_buyer_time": body.expired_buyer_time,
            "status": 'waiting_payment',
            "created_by": req.user.id,
            "updated_by": req.user.id
        }
        createOrder(order, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully insert order"
            })
        });
    },
    getOrderBySellerId: (req, res) => {
        const id = req.user.id;
        getOrderBySellerId(id, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            if(!results){
                return res.status(200).json({
                    success: 0,
                    message: "Record not found"
                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        });
    },
    getOrderByCode: (req, res) => {
        const code = req.query.code;
        getOrderByCode(code, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            if(!results){
                return res.status(200).json({
                    success: 0,
                    message: "Record not found"
                })
            }
            snap.transaction.status(code)
            .then((response)=>{
                results.payment = response;
                const jsontoken = sign({result: results}, process.env.JWT_KEY, {
                    expiresIn: process.env.JWT_EXPIRED
                });
                return res.status(200).json({
                    success: 1,
                    data: results,
                    token: jsontoken
                })
            }).catch((error) => {
                return res.status(200).json({
                    success: 0,
                    error: error.ApiResponse
                })
            })
        });
    }
}