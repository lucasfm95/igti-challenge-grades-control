import express from "express";
import winston from "winston";
import cors from "cors";
import { promises as fs } from "fs"
import gradesRouter from "./routes/grades.js";

const { readFile, writeFile } = fs;

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
});

global.fileNameGrades = "grades.json";

// config server express
const app = express();

app.use(express.json());
app.use(cors());
app.use("/grades", gradesRouter);

app.listen(3000, async () => {
    try {
        await readFile(global.fileNameGrades);
        logger.info("API started!");
    } catch (error) {
        logger.info("File grades.json not found");

        let initialGrades = {
            nextId: 1,
            grades: []
        }

        writeFile(global.fileNameGrades, JSON.stringify(initialGrades))
            .then(() => logger.info("API started and file grades.json created"))
            .catch((error) => logger.error(error));
    }
});