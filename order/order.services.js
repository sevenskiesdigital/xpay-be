const pool = require("../config/database");
const bodyParser = require('body-parser');
const fs = require('fs');

module.exports = {
    uploadImage: (data, callBack) => {
        try {     
            // to declare some path to store your converted image
            const path = './images/'+Date.now()+'.jpg'
     
            const imgdata = data.base64image;
     
            // to convert base64 format into random filename
            const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
            
            fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
     
            return callBack(null, path)
     
        } catch (error) {
            return callBack(error);
        }
    },
    shipOrder: (data, callBack) => {
        pool.query(
            'UPDATE `order` set status=?, updated_by=? where id=? AND seller_id=?',
            [
                data.status,
                data.updated_by,
                data.order_id,
                data.seller_id
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
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