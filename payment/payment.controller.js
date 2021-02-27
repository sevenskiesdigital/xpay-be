const { snap } = require("./payment.services");

module.exports = {
    snap: (req, res) => {
        const body = req.user;
        snap(body, (err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Payment error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: "Payment successfully",
                data: results
            })
        });
    }
}