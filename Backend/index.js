const express = require ("express")
const cors = require ("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db.js")

dotenv.config();

const app = express();
app.use(cors());

connectDB();

const PORT = process.env.PORT;

app.use('api/authRoutes',require('./routes/authRoutes.js'))

app.listen(PORT,()=>{
    console.log(`Server started at Port - ${PORT}`);
})
app.get("/",(req,res)=>{
    res.send(`ShopNeext running on port ${PORT}`);
})