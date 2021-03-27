require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./user/user.router")
const paymentRouter = require("./payment/payment.router")
const orderRouter = require("./order/order.router")
const payoutRouter = require("./payout/payout.router")
var cors = require('cors')

app.use(cors())
app.use(express.json());

app.get("/api", (req, res)=>{
    res.json({
        success: 1,
        message: "This rest api is working"
    })
})

app.use("/user", userRouter);
app.use("/payment", paymentRouter);
app.use("/order", orderRouter);
app.use("/payout", payoutRouter);

app.listen(process.env.APP_PORT, ()=>{
    console.log("Server up and running on PORT: ", process.env.APP_PORT);
})