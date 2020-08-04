import express from "express";
import winston from "winston";
import cors from "cors";
import gradesRouter from "./routes/grades.js";

// config log
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

global.logger = winston.createLogger({
    level: "silly",
    transports: [
        new (winston.transports.Console)()
    ],
    format: combine(
        label({ label: "grades-control-api" }),
        timestamp(),
        myFormat
    )
})

// config server express
const app = express();

app.use(express.json());
app.use(cors());
app.use("/grades", gradesRouter);

app.listen(3000, () => {
    logger.info("API Started!");
});