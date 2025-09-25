import { StatusCodes } from 'http-status-codes';

export class HttpException extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ConflictException extends HttpException {
  constructor(public readonly resource?: string) {
    super(StatusCodes.CONFLICT, `Resources already exist ${resource}`);
  }
}

export class ForbiddenException extends HttpException {
  constructor() {
    super(StatusCodes.FORBIDDEN, 'The user does not have permission to make changes to this resource');
  }
}

export class InternalServerException extends HttpException {
  constructor() {
    super(StatusCodes.INTERNAL_SERVER_ERROR, "Error from the server");
  }
}

export class NotFoundException extends HttpException {
  constructor(public readonly resource?: string) {
    super(StatusCodes.NOT_FOUND, `Resource not found ${resource}`);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(public readonly resource?: string) {
    super(StatusCodes.UNAUTHORIZED, `You are not authenticated because the token ${resource}`);
  }
}

