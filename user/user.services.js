const pool = require("../config/database");
const request = require("request");
const nodemailer = require('nodemailer');

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
    sendMail: (data, callBack) => {
        const mailData = {from: 'youremail@gmail.com',  // sender address
            to: data.email,   // list of receivers
            subject: 'Email OTP',
            text: 'Please do not share to anyone!',
            html: '<b>Hey there! </b><br> Your OTP is'+data.otp+'<br/>'
        };
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
              user: 'sevenskies.digital@gmail.com',
              pass: 'KiGedeUtam4',
            },
          });
        // transporter.verify().then(console.log).catch(console.error);
        transporter.sendMail(mailData, function(err, info) {
            if(err){
                return callBack(err)
            } else {
                return callBack(null, info)
            }
        })
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
    setFace: (data, callBack) => {
        let params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'age,gender'
        }
        
        let options = {
            uri : process.env.AZURE_URI_BASE + "face/v1.0/detect",
            qs: params,
            body : Buffer.from(data.face, "base64"),
            headers : {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': process.env.AZURE_SUBSCRIPTION_KEY
            }
        }
        request.post(options, (error, response, body) => {
            if(error){
                return callBack(error)
            }
            if(JSON.parse(body).length > 0){
                let faceId = JSON.parse(body)[0].faceId;
                options = {
                    uri : process.env.AZURE_URI_BASE + "face/v1.0/largepersongroups/"+
                        process.env.AZURE_PERSON_GROUP+"/persons/"+data.email+"/persistedfaces",
                    body : JSON.stringify({
                        'persistedFaceId': faceId
                    }),
                    headers : {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Ocp-Apim-Subscription-Key': process.env.AZURE_SUBSCRIPTION_KEY
                    }
                }
                request.post(options, (error, response, body) => {
                    if(error){
                        return callBack(error)
                    }
                    let jsonResponse = JSON.stringify(JSON.parse(body), null, '');
                    return callBack(null, jsonResponse)
                })
            } else {
                return callBack(true)}
        })
    },
    verifyFace: (data, callBack) => {
        const params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'age,gender'
        }
        
        const options = {
            uri : process.env.AZURE_URI_BASE + "face/v1.0/detect",
            qs: params,
            body : Buffer.from(data.face, "base64"),
            headers : {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': process.env.AZURE_SUBSCRIPTION_KEY
            }
        }
        request.post(options, (error, response, body) => {
            if(error){
                return callBack(error)
            }
            let jsonResponse = JSON.stringify(JSON.parse(body), null, '');
            return callBack(null, jsonResponse)
        })
    }
}