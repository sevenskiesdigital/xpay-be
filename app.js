require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./user/user.router")
const paymentRouter = require("./payment/payment.router")
const orderRouter = require("./order/order.router")
const payoutRouter = require("./payout/payout.router")
const { statusOrder } = require("./order/order.services");
const logger = require('./logger')
var morgan = require('morgan');
var cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const schedule = require('node-schedule');
/* const someDate = new Date('2022-03-13T09:00:00.000+4:00');
schedule.scheduleJob(someDate, () => {
    console.log('Job ran at', new Date().toString());
});*/

var timer = '*/1 * * * *';
/*schedule.scheduleJob(timer, () => {
    console.log('Job ran at', new Date().toString());
    
    const body = {
        "previous_order_status": "waiting_payment",
        "next_order_status": "waiting_shipping",
        "limit_time": 1
    }
    body.updated_by = 'SCHEDULER'
    statusOrder(body, (err, results) => {
        if(err){
            console.log({
                success: 0,
                message: "Database connection error",
                data: err
            })
        }
        console.log({
            success: 1,
            message: "Successfully update order",
            data: results
        })
    });
});*/

const { swaggerDocument } = require("./swagger");

app.use(cors())
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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