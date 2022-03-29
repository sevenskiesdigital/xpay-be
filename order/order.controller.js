const { createOrder, getOrderBySellerId, getOrderByBuyerId, getOrderByCode, getOrderById, uploadImage, shipOrder, paymentReceived, finishOrder, statusOrder, createOrderHistory, getOrderHistoryByOrderId } = require("./order.services");
const { getUserByUserEmail2 } = require("../user/user.services");
const { getFee, createOrderFee, getOrderFee } = require("../fee/fee.services");
const { sign } = require("jsonwebtoken");
const midtransClient = require('midtrans-client');

// Create Snap API instance
let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY
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
        getUserByUserEmail2(body.buyer_email).then(
            response => {
                var order = {
                    "seller_id": req.user.id,
                    "buyer_id": response.id,
                    "product_name": body.product_name,
                    "note": body.note,
                    "amount": body.amount,
                    "payment_code": code,
                    "expired_buyer_time": body.expired_buyer_time,
                    "status": 'waiting_payment',
                    "created_by": req.user.id,
                    "updated_by": req.user.id
                }
                createOrder(order, (err,results1) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        })
                    }            
                    
                    getOrderByCode(code, (err, results2) => {
                        if(err){
                            console.log(err);
                            return res.status(500).json({
                                success: 0,
                                message: "Database connection error"
                            })
                        }
                        if(!results2){
                            return res.status(200).json({
                                success: 0,
                                message: "Record not found"
                            })
                        }
                        var order_history = {
                            "order_id": results2.id,
                            "previous_status": '',
                            "current_status": results2.status,
                            "note": '',
                            "created_by": req.user.id
                        }
                        createOrderHistory(order_history, (err, results) => {
                            if(err){
                                console.log(err);
                                return res.status(500).json({
                                    success: 0,
                                    message: "Database connection error"
                                })
                            }
                            getFee('payment', (err, results) => {
                                if(err){
                                    console.log(err);
                                    return res.status(500).json({
                                        success: 0,
                                        message: "Database connection error"
                                    })
                                }
                                results2.fee = []
                                results.forEach(fee => {
                                    var amount;
                                    if(fee.method == 'amount'){
                                        amount = fee.amount;
                                    } else {
                                        amount = fee.percentage * body.amount / 100;
                                    }
                                    var paymentFee = {
                                        "order_id": results2.id,
                                        "order_code": code,
                                        "fee_id": fee.id,
                                        "name": fee.name,
                                        "amount": amount,
                                        "created_by": req.user.id,
                                        "updated_by": req.user.id
                                    }
                                    results2.fee.push(paymentFee);
                                    createOrderFee(paymentFee, (err, results) => {
                                        console.log(paymentFee);
                                        if(err){
                                            console.log(err);
                                            return res.status(500).json({
                                                success: 0,
                                                message: "Database connection error"
                                            })
                                        }
                                    });
                                });
                                return res.status(200).json({
                                    success: 1,
                                    message: "Successfully insert order",
                                    data: results2
                                })
                            });
                        });
                    });
                    /*return res.status(200).json({
                        success: 1,
                        message: "Successfully insert order"
                    })*/
                });
            }
        )    
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
                    message: "Successfully update order",
                    data: results
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
                message: "Successfully update order",
                data: results
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
            if(results.status != "payment_received" && results.status != "waiting_shipping"){
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
                    message: "Successfully update order",
                    data: results
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
    getOrderHistoryByOrderId: (req, res) => {
        const id = req.query.id;
        getOrderHistoryByOrderId(id, (err, results) => {
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
            getOrderFee(code, (err, results2) => {
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        success: 0,
                        message: "Database connection error"
                    })
                }
                results.fee = results2;
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
                    return res.status(200).json({
                        success: 1,
                        data: results
                    })
                }).catch((error) => {
                    results.payment = error.ApiResponse;
                    return res.status(200).json({
                        success: 1,
                        data: results,
                    })
                })
            });            
        });
    }
}
