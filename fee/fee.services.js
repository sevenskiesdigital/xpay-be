const pool = require("../config/database");

module.exports = {
    getFee: (type, callBack) => {
        pool.query('SELECT `id`, `name`, `type`, `method`, `percentage`, `amount`, `is_active`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `fee` WHERE type = ? and is_active=1',
            [type],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
    getOrderFee: (code, callBack) => {
        pool.query('SELECT `id`, `order_id`, `order_code`, `fee_id`, `name`, `amount`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order_fee` WHERE order_code = ?',
            [code],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
    createOrderFee: (data, callBack) => {
        pool.query(
            'INSERT INTO `order_fee`(`order_id`, `order_code`, `fee_id`, `name`, `amount`, `created_by`, `updated_by`) values(?,?,?,?,?,?,?)',
            [
                data.order_id,
                data.order_code,
                data.fee_id,
                data.name,
                data.amount,
                data.created_by,
                data.updated_by
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    }
}