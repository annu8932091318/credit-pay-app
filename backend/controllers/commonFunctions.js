function formatResponse(data, message = 'Success') {
  return {
    status: 'ok',
    message,
    data,
  };
}

module.exports = {
  formatResponse,
}; 