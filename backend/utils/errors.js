class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode || 500;
      this.isOperational = true; // Distinguish operational errors from programming errors
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
    }
  }
  
  class AuthorizationError extends AppError {
    constructor(message = 'Not authorized to access this resource') {
      super(message, 403);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
      super(message, 400);
      this.errors = errors; // Array of validation errors
    }
  }
  
  class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
      super(message, 409);
    }
  }
  
  class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
      super(message, 500);
    }
  }
  
  module.exports = {
    AppError,
    NotFoundError,
    AuthorizationError,
    ValidationError,
    ConflictError,
    DatabaseError
  };