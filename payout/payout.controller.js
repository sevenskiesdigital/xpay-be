const { payout, createPayout } = require("./payout.services");
const { getOrderBySellerId } = require("../order/order.services");
const midtransClient = require('midtrans-client');

// Create Snap API instance
let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY
    });

module.exports = {
    payoutBySellerId: (req, res) => {
        const id = req.user.id;
        const body = req.body;
        getOrderBySellerId(id, "finished", (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            if(!results || results.length==0){
                return res.status(200).json({
                    success: 0,
                    message: "Record not found"
                })
            }      
            const amount = results.map(order => order.amount).reduce((prev, next) => prev + next);
            var data_payout = {
                "beneficiary_name": body.beneficiary_name,
                "beneficiary_account": body.beneficiary_account,
                "beneficiary_bank": body.beneficiary_bank,
                "beneficiary_email": req.user.email,
                "amount": ""+amount,
                "notes": body.notes,
              }     
            payout(data_payout, (err, results) => {
                if(err){
                    console.log(err.ApiResponse);
                    return res.status(500).json({
                        success: 0,
                        message: err.ApiResponse
                    })
                }
                createPayout(payment, (err, results2) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        })
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Initiate Payout successfully",
                        data: results
                    })
                });
            });
        });
    },
    payoutByOrderId: (req, res) => {
        const id = req.user.id;
        const body = req.body;
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
            payout(body, (err, results) => {
                if(err){
                    console.log(err.ApiResponse);
                    return res.status(500).json({
                        success: 0,
                        message: err.ApiResponse
                    })
                }
                var payout = {
                    "beneficiary_name": body.beneficiary_name,
                    "beneficiary_account": body.beneficiary_account,
                    "beneficiary_bank": body.beneficiary_bank,
                    "beneficiary_email": req.user.email,
                    "amount": body.amount,
                    "notes": body.notes,
                    "created_by": id
                  }
                createPayout(payment, (err, results2) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        })
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Initiate Payout successfully",
                        data: results
                    })
                });
            });
        });
    }
}