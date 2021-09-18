const pool = require("../config/database");

module.exports = {
    createUser: (data, callBack) => {
        pool.query(
            'insert into user(pin, phone_number, email, first_name, last_name) values(?, ?,?,?,?)',
            [
                data.pin,
                data.phone_number,
                data.email,
                data.first_name,
                data.last_name
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    updateUser: (data, callBack) => {
        pool.query(
            'update user set pin=?, phone_number=?, email=?, first_name=?, last_name=? where id=?',
            [
                data.pin,
                data.phone_number,
                data.email,
                data.first_name,
                data.last_name,
                data.id
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    getUserByUserEmail: (email, callBack) => {
        pool.query('select id, pin, email, phone_number, first_name, last_name from user where email = ?',
            [email],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    generateOtp: (data, callBack) => {
        pool.query(
            'insert into otp(email, otp, expires_in) values(?, ?, ?)',
            [
                data.email,
                data.otp,
                data.expires_in
            ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results[0])
            }
        );
    },
    verifyOtp: (data, callBack) => {
        pool.query('select id from otp where email = ? and otp = ? and expires_in >= ?',
        [
            data.email,
            data.otp,
            data.expires_in
        ],
            (error, results, fields) => {
                if(error){
                    return callBack(error)
                }
                return callBack(null, results)
            }
        );
    },
}