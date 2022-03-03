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
                return callBack(null, results)
            }
        );
    },
    finishOrder: (data, callBack) => {
        pool.query(
            'UPDATE `order` set status=?, updated_by=? where id=?',
            [
                data.status,
                data.updated_by,
                data.order_id
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
    statusOrder: (data, callBack) => {
        pool.query(
            'UPDATE `order` set status=?, updated_by=? where status=? and (UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(created_at) >= ?)',
            [
                data.next_order_status,
                data.updated_by,
                data.previous_order_status,
                data.limit_time
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
    paymentReceived: (data, callBack) => {
        pool.query(
            'UPDATE `order` set status=?, updated_by=? where id=?',
            [
                data.status,
                data.updated_by,
                data.order_id
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
    createOrderHistory: (data, callBack) => {
        pool.query(
            'INSERT INTO `order_history`(`order_id`, `note`, `previous_status`, `current_status`, `created_by`) values(?,?,?,?,?)',
            [
                data.order_id,
                data.note,
                data.previous_status,
                data.current_status,
                data.created_by
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
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
                return callBack(null, results)
            }
        );
    },
    getOrderByBuyerId: (id, status, callBack) => {
        if(status==""){
            pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE buyer_id = ?',
                [id],
                (error, results, fields) => {
                    if(error){
                        return callBack(error)
                    }
                    return callBack(null, results)
                }
            );
        }else{
            pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE buyer_id = ? AND status = ?',
                [id, status],
                (error, results, fields) => {
                    if(error){
                        return callBack(error)
                    }
                    return callBack(null, results)
                }
            );
        }
    },
    getOrderBySellerId: (id, status, callBack) => {
        if(status==""){
            pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE seller_id = ?',
                [id],
                (error, results, fields) => {
                    if(error){
                        return callBack(error)
                    }
                    return callBack(null, results)
                }
            );
        }else{
            pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE seller_id = ? AND status = ?',
                [id, status],
                (error, results, fields) => {
                    if(error){
                        return callBack(error)
                    }
                    return callBack(null, results)
                }
            );
        }
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
    },
    getOrderById: (id, callBack) => {
        pool.query('SELECT `id`, `seller_id`, `buyer_id`, `product_name`, `note`, `amount`, `payment_code`, `expired_buyer_time`, `expired_seller_time`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by` FROM `order` WHERE id = ?',
            [id],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    getOrderHistoryByOrderId: (id, callBack) => {
        pool.query('SELECT `id`, `order_id`, `previous_status`, `current_status`, `note`,  `created_at`, `created_by` FROM `order_history` WHERE order_id = ?',
            [id],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    }
}