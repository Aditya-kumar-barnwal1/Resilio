import dotenv from "dotenv";
dotenv.config();
import express, { urlencoded } from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import multer from "multer";
import UserRouter from "./routes/UserRoute.js";
const upload=multer({dest:'uploads/'})
const app=express();
connectDB();

app.use(express.json());
app.use(cors());

app.use('/api/v1',UserRouter);
app.post('/uploadImage',upload.single('Aditya'),(req,res)=>{
    console.log(req.file);
    res.send("Uploaded the file successfully");
})
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`App listens at PORT ${PORT}`);
})
