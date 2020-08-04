import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.get("/", async (request, response, next) => {
    try {
        logger.info(`Get all grades`);

        const grades = JSON.parse(await readFile(global.fileNameGrades));
        if (grades) {
            delete grades.nextId;
            response.send(grades);
        } else {
            let error = "Fail to get all grades";
            logger.error(error);
            response.status(400).send({ error: error });
        }
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (request, response, next) => {
    try {
        logger.info(`Get grade by id`);

        const id = Number(request.params.id);

        if (!request.params.id && !id > 0) {
            let error = "The field id invalid";
            logger.error(error);
            response.status(400).send({ error: error });
        }

        const data = JSON.parse(await readFile(global.fileNameGrades));

        const index = data.grades.findIndex(grade => grade.id === id);

        if (index === -1) {
            response.status(204).end();
        } else {
            response.send(data.grades[index]);

            logger.info("Get grade successfully");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/", async (request, response, next) => {

    try {
        let gradeModel = request.body;

        logger.info(`Post grade: ${JSON.stringify(gradeModel)}`);

        if (!gradeModel || !gradeModel.student || !gradeModel.subject || !gradeModel.type || !gradeModel.value) {
            let error = "The fields student, subject, type and value are required to create a grade";
            logger.error(error);
            response.status(400).send({ error: error });
        }

        const data = JSON.parse(await readFile(global.fileNameGrades));

        let grade = {
            id: data.nextId++,
            student: gradeModel.student,
            subject: gradeModel.subject,
            type: gradeModel.type,
            value: gradeModel.value,
            timestamp: new Date()
        }

        data.grades.push(grade);

        await writeFile(global.fileNameGrades, JSON.stringify(data));

        logger.info("Grade added successfully");

        response.send(grade);
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (request, response, next) => {
    try {
        let gradeModel = request.body;

        logger.info(`Put grade: ${JSON.stringify(gradeModel)}`);

        if (!request.params.id && !Number(request.params.id) > 0) {
            let error = "The field id invalid";
            logger.error(error);
            response.status(400).send({ error: error });
        }

        if (!gradeModel || !gradeModel.student || !gradeModel.subject || !gradeModel.type || !gradeModel.value) {
            let error = "The fields student, subject, type and value are required to update a grade";
            logger.error(error);
            response.status(400).send({ error: error });
        }

        const data = JSON.parse(await readFile(global.fileNameGrades));
        const index = data.grades.findIndex(grade => grade.id === Number(request.params.id));

        if (index === -1) {
            let error = "Grade not found, id invalid";
            logger.error(error);
            response.status(400).send({ error: error });
        }

        data.grades[index].student = gradeModel.student;
        data.grades[index].subject = gradeModel.subject;
        data.grades[index].type = gradeModel.type;
        data.grades[index].value = gradeModel.value;
        data.grades[index].timestamp = new Date();

        await writeFile(global.fileNameGrades, JSON.stringify(data));

        logger.info("Grade updated successfully");

        response.send(data.grades[index]);

    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (request, response, next) => {
    try {
        logger.info(`Delete grade`);

        const id = Number(request.params.id);

        if (!request.params.id && !id > 0) {
            let error = "The field id invalid";
            logger.error(error);
            response.status(400).send({ error: error });
        }

        const data = JSON.parse(await readFile(global.fileNameGrades));

        const index = data.grades.findIndex(grade => grade.id === id);

        if (index === -1) {
            let error = "Grade not found, id invalid";
            logger.error(error);
            response.status(204).send({ error: error });
        }

        data.grades = data.grades.filter(grade => grade.id !== id);

        await writeFile(global.fileNameGrades, JSON.stringify(data));

        logger.info("Grade deleted successfully");

        response.end();
    } catch (error) {
        next(error);
    }
});

router.use((error, request, response, next) => {
    logger.error(`${request.method} ${request.baseUrl} - ${error.message}`);
    response.status(500).send({ error: error.message });
})

export default router;