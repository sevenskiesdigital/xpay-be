const { snap, createPayment, updatePaymentByCode } = require("./payment.services");

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
    snap: (req, res) => {
        const body = req.body;
        var data = {
            "code": body.payment_code,
            "is_active": 0
        }
        updatePaymentByCode(data, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                })
            }
            snap(body, (err, results) => {
                if(err){
                    console.log(err.ApiResponse);
                    return res.status(500).json({
                        success: 0,
                        message: err.ApiResponse.error_messages[0]
                    })
                }
                var payment = {
                    "id": randomString(16, '#aA'),
                    "code": body.payment_code,
                    "token": results.token,
                    "redirect_url": results.redirect_url,
                    "is_active": 1,
                    "created_by": req.user.id,
                    "updated_by": req.user.id
                }
                createPayment(payment, (err, results2) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        })
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Initiate Payment successfully",
                        data: results
                    })
                });
            });
        });
    }
}