require('dotenv').config();
// src/app.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3125;

// imports
const errorHandler = require('./utils/errorHandler');
const AppError = require('./utils/AppError')
const router = require('./routers');
const logger = require("./logger");
const morgan = require("morgan");
const cors = require('cors');
const connectDB = require('./config/dbConfig');

const morganFormat = ":method :url :status :response-time ms";

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Routes
app.use('/api/v1/', router);

// Connect to database
connectDB();

// 404 Route Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handling Middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on PORT:${port}`);
});