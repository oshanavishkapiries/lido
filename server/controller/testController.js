const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/responseHandler');

const testController = catchAsync(async (req, res, next) => {
   
    //sendError(res, 400, 'Error message');
    sendResponse(res, 200, { message: 'Hello World' }, 'Test endpoint successful');
});

module.exports = testController;
