const { createOrder, getOrderBySellerId, getOrderByCode, uploadImage, shipOrder, paymentReceived, finishOrder } = require("./order.services");
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
        const code = randomString(5, '#aA');
        var order = {
            "seller_id": req.user.id,
            "buyer_id": body.buyer_id,
            "product_name": body.product_name,
            "note": body.note,
            "amount": body.amount,
            "payment_code": code,
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
                return res.status(200).json({
                    success: 1,
                    message: "Successfully insert order",
                    data: results
                })
            });
            /*return res.status(200).json({
                success: 1,
                message: "Successfully insert order"
            })*/
        });
    },
    uploadImage: (req, res) => {
        const body = req.body;
        var order = {
            "base64image": body.base64image,
            "order_id": body.order_id
        }
        uploadImage(order, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Upload image error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully upload image",
                data: results
            })
        });
    },
    finishOrder: (req, res) => {
        const buyer_order = req.user;
        var order = {
            "order_id": buyer_order.id,
            "status": 'finished',
            "updated_by": buyer_order.buyer_id
        }
        finishOrder(order, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully update order"
            })
        });
    },
    paymentReceived: (req, res) => {
        const body = req.body;
        var order = {
            "order_id": body.order_id,
            "status": 'waiting_shipping',
            "updated_by": req.user.id
        }
        paymentReceived(order, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully update order"
            })
        });
    },
    shipOrder: (req, res) => {
        const body = req.body;
        var order = {
            "order_id": body.order_id,
            "status": 'on_shipping',
            "updated_by": req.user.id,
            "seller_id": req.user.id
        }
        shipOrder(order, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully update order"
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
                if(response.transaction_status == "capture" || response.transaction_status == "settlement"){
                    if(results.status == "waiting_payment"){
                        results.status = "waiting_shipping";
                        var order = {
                            "order_id": results.id,
                            "status": 'waiting_shipping',
                            "updated_by": results.buyer_id
                        }
                        console.log(order);
                        paymentReceived(order, (err, results) => {
                        });
                    }
                }
                const jsontoken = sign({result: results}, process.env.JWT_KEY, {
                    expiresIn: process.env.JWT_EXPIRED
                });
                return res.status(200).json({
                    success: 1,
                    data: results,
                    token: jsontoken
                })
            }).catch((error) => {
                results.payment = error.ApiResponse;
                const jsontoken = sign({result: results}, process.env.JWT_KEY, {
                    expiresIn: process.env.JWT_EXPIRED
                });
                return res.status(200).json({
                    success: 1,
                    data: results,
                    token: jsontoken
                })
            })
        });
    }
}