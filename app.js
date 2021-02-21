require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./user/user.router")

app.use(express.json());

app.get("/api", (req, res)=>{
    res.json({
        success: 1,
        message: "This rest api is working"
    })
})

app.use("/user", userRouter);

app.listen(process.env.APP_PORT, ()=>{
    console.log("Server up and running on PORT: ", process.env.APP_PORT);
})