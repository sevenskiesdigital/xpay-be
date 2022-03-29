const pool = require("../config/database");
const midtransClient = require('midtrans-client');
// Create Snap API instance
let iris = new midtransClient.Iris({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction : false,
        serverKey : process.env.MIDTRANS_SERVER_KEY
    });


module.exports = {
    payout: (data, callBack) => {
        /*let parameter = {
            "payouts": [
                {
                  "beneficiary_name": "Jon Snow",
                  "beneficiary_account": "1172993826",
                  "beneficiary_bank": "bni",
                  "beneficiary_email": "beneficiary@example.com",
                  "amount": "100000.00",
                  "notes": "Payout April 17"
                }
              ]
        };*/
        iris.createPayouts(data)
        .then((transaction)=>{
            return callBack(null, transaction)
        }).catch((error) => {
            return callBack(error);
        })
    },
    createPayout: (data, callBack) => {
        pool.query(
            'INSERT INTO `payout`(`beneficiary_name`, `beneficiary_account`, `beneficiary_bank`, `beneficiary_email`, `amount`, `notes`, `created_by`) values(?,?,?,?,?,?,?)',
            [
                data.beneficiary_name,
                data.beneficiary_account,
                data.beneficiary_bank,
                data.beneficiary_email,
                data.amount,
                data.notes,
                data.user_id
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