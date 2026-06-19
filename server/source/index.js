import dbConnect from './db/dbConnect.js'
import app from './app.js'
import apiError from './utils/apiError.js';
import dotenv from "dotenv" 

dotenv.config()


const port = process.env.PORT || 3000

dbConnect().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`) 
    })
}).catch((error) => {
    throw new apiError('Database connection failed', 500, error);
})
 