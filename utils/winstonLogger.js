import { createLogger, transports, format } from 'winston';
import path from "path";
import fs from "fs";

let logDir = "logs";

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const customFormat = format.printf(({level, message, timestamp}) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
})

const logger = createLogger({
  levels,
  level: 'info',
  format: format.combine(
    format.timestamp(),
    customFormat
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'app.log') })
  ],
});

// Middleware function
const logMiddleware = (req, res, next) => {
    const startHrTime = process.hrtime();

    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedTimeInMs.toFixed(2)}ms`;

        if (res.statusCode >= 400) {
            logger.error(logMessage);
        } else {
            logger.info(logMessage);
        }
    });

    next();
};

export default logMiddleware;
export { logger };