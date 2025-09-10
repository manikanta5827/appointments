import express from "express";
import logMiddleware from "./utils/winstonLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import dotenv from 'dotenv';
import appRoutes from "./routes/appRoutes.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(logMiddleware);

app.get('/', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});

//router
app.use('/', appRoutes);

//error handler
app.use(errorHandler);


const PORT = process.env.PORT || 3400;
app.listen(PORT,()=>{
    console.log('HTTP server listening on port...', PORT);
})