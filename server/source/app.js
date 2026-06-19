import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import apiResponse from "./utils/apiResponse.js"


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))
app.use(cookieParser())
app.use(express.static("public"))


      
// import routes
import userRouter from "./routes/user.routes.js"
import itemRouter from "./routes/item.routes.js"
import customerRouter from "./routes/customer.routes.js"
import invoiceCustomizerRouter from "./routes/invoiceCustomizer.routes.js"
import invoiceRouter from "./routes/invoice.routes.js"



// routes
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/item', itemRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/invoice-customizer', invoiceCustomizerRouter);
app.use('/api/v1/invoice', invoiceRouter);




// global error handler
app.use((err, req, res, next) => { 
  console.error("ERROR:", err)
  const statusCode = err.statusCode || 500

  res.status(statusCode).json(
    new apiResponse(err.message, statusCode, null, false, err.code)
  )
})


export default app;