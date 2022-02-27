const { createOrder, getOrderBySellerId, getOrderByBuyerId, getOrderByCode, getOrderById, uploadImage, shipOrder, paymentReceived, finishOrder, statusOrder } = require("./order.services");
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
        createOrder(order, (err,results) => {
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
    statusOrder: (req, res) => {
        const body = req.body;
        body.updated_by = 'SCHEDULER'
        statusOrder(body, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Successfully update order",
                data: results
            })
        });
    },
    finishOrder: (req, res) => {
        const body = req.body;        
        getOrderById(body.order_id, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            if(results.buyer_id != req.user.id){
                return res.status(500).json({
                    success: 0,
                    message: "Unauthorized access"
                })
            }
            if(results.status != "on_shipping"){
                return res.status(500).json({
                    success: 0,
                    message: "Order status is "+results.status
                })
            }
            var order = {
                "order_id": body.order_id,
                "status": 'finished',
                "updated_by": req.user.id
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
        getOrderById(body.order_id, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            if(results.seller_id != req.user.id){
                return res.status(500).json({
                    success: 0,
                    message: "Unauthorized access"
                })
            }
            if(results.status != "payment_received"){
                return res.status(500).json({
                    success: 0,
                    message: "Order status is "+results.status
                })
            }
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
        });
    },
    getOrderBySellerId: (req, res) => {
        const id = req.user.id;
        const status = req.query.status?req.query.status:"";
        getOrderBySellerId(id, status, (err, results) => {
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
    getOrderByBuyerId: (req, res) => {
        const id = req.user.id;
        const status = req.query.status?req.query.status:"";
        getOrderByBuyerId(id, status, (err, results) => {
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
