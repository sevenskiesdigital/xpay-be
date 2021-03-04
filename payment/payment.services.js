const pool = require("../config/database");
const midtransClient = require('midtrans-client');
// Create Snap API instance
let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction : false,
        serverKey : 'SB-Mid-server-qug5i26hvYpNpdZDXxk735ko'
    });

module.exports = {
    snap: (data, callBack) => {
        let parameter = {
            "transaction_details": {
                "order_id": data.payment_code,
                "gross_amount": data.amount
            },
            "credit_card":{
                "secure" : true
            }
        };
        snap.createTransaction(parameter)
        .then((transaction)=>{
            return callBack(null, transaction)
        }).catch((error) => {
            return callBack(error);
        })
    },
    createPayment: (data, callBack) => {
        pool.query(
            'INSERT INTO `payment`(`id`, `code`, `token`, `redirect_url`, `is_active`, `created_by`, `updated_by`) values(?,?,?,?,?,?,?)',
            [
                data.id,
                data.code,
                data.token,
                data.redirect_url,
                data.is_active,
                data.created_by,
                data.updated_by
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    getPaymentByCode: (code, callBack) => {
        pool.query('SELECT `id`, `code`, `token`, `redirect_url`, `status`, `is_active`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `payment` WHERE code = ?',
            [code],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    updatePaymentByCode: (data, callBack) => {
        pool.query(
            'update payment set is_active=?, status=? where code=?',
            [
                data.is_active,
                data.status,
                data.code
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    }
}