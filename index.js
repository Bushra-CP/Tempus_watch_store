const express=require('express');
const app=express();
const env=require('dotenv').config();
const logger=require('./utils/logger');
const connectDB=require('./config/db');




connectDB();
app.listen(process.env.PORT,()=>{
    logger.info('Server listening');
})