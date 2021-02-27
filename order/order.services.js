const pool = require("../config/database");

module.exports = {
    createOrder: (data, callBack) => {
        pool.query(
            'INSERT INTO `order`(`seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `status`, `created_by`, `updated_by`) values(?,?,?,?,?,?,?,?,?,?)',
            [
                data.seller_id,
                data.buyer_id,
                data.product_name,
                data.note,
                data.amount,
                data.payment_code,
                data.expired_buyer_time,
                data.status,
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
    getOrderBySellerId: (id, callBack) => {
        pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE seller_id = ?',
            [id],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
    getOrderByCode: (code, callBack) => {
        pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE payment_code = ?',
            [code],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    }
}