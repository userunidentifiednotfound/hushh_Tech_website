export class IntelligenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntelligenceError";
  }
}

export class NotFoundError extends IntelligenceError {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends IntelligenceError {
  constructor(message = "User is not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class StorageError extends IntelligenceError {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export class ValidationError extends IntelligenceError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
