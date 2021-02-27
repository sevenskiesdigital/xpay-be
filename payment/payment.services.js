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
    }
}