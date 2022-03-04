require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./user/user.router")
const paymentRouter = require("./payment/payment.router")
const orderRouter = require("./order/order.router")
const payoutRouter = require("./payout/payout.router")
const logger = require('./logger')
var morgan = require('morgan');
var cors = require('cors')

app.use(cors())
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));

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

app.listen(process.env.PORT || process.env.APP_PORT, ()=>{
    logger.info(message= "Server up and running on PORT: ", process.env.PORT || process.env.APP_PORT);
})