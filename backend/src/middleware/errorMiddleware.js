export const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  
  const errorMessage = err.message || '';
  const lowerMsg = errorMessage.toLowerCase();
  
  const isValidation = lowerMsg.includes('required') || 
                       lowerMsg.includes('invalid') || 
                       lowerMsg.includes('stock') || 
                       lowerMsg.includes('allow') || 
                       lowerMsg.includes('negative') ||
                       lowerMsg.includes('missing');
                       
  if (statusCode === 500 && isValidation) {
    statusCode = 400;
  }

  const responseMessage = statusCode === 500 ? 'Internal server error' : (errorMessage || 'An error occurred');

  return res.status(statusCode).json({
    success: false,
    message: responseMessage
  });
};
