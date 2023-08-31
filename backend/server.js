import pg from 'pg';
import express from 'express';
import boards from './routes/boards.js';
import database from './helpers/database.js';
import rateLimit from 'express-rate-limit';

const app = express();
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
});

process.on("uncaughtException", (exception) => {
    console.log(exception);
})

process.on("unhandledRejection", (rejection) => {
    console.log(rejection);
});

app.use(express.json());

app.use('/api', limiter);
app.use('/api/boards', boards);

app.listen(1337, async () => {
    await database.setupDatabase();
    
    console.log("[LOG] Listening on Port 1337");
});
