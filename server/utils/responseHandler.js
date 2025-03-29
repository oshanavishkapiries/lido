/**
 * Response handler utility for standardizing API responses
 */

const sendResponse = (res, statusCode, data = null, message = 'Success') => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

const sendError = (res, statusCode, message = 'Error occurred') => {
  res.status(statusCode).json({
    status: 'error',
    message
  });
};

const sendValidationError = (res, message = 'Validation failed') => {
  sendError(res, 400, message);
};

const sendNotFoundError = (res, message = 'Resource not found') => {
  sendError(res, 404, message);
};

const sendUnauthorizedError = (res, message = 'Unauthorized access') => {
  sendError(res, 401, message);
};

const sendForbiddenError = (res, message = 'Access forbidden') => {
  sendError(res, 403, message);
};

const sendServerError = (res, message = 'Internal server error') => {
  sendError(res, 500, message);
};

module.exports = {
  sendResponse,
  sendError,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendServerError
}; 