class ApiError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode = 500,
    error = null,
    code = "INTERNAL_ERROR"
  ) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.code = code;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
