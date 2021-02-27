const { createOrder, getOrderBySellerId, getOrderByCode } = require("./order.services");

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
            "status": 'open',
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
            return res.status(200).json({
                success: 1,
                data: results
            })
        });
    }
}