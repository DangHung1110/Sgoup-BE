import { ClientException, ServerException } from '@tsed/exceptions';
import { StatusCodes } from 'http-status-codes';

export class ConflictException extends ClientException {
  constructor(public readonly resource?: string) {
    super(StatusCodes.CONFLICT, `Resources already exist ${resource}`);
  }
}

export class ForbiddenException extends ClientException {
  constructor() {
    super(StatusCodes.FORBIDDEN, 'The user does not have permission to make changes to this resource');
  }
}

export class InternalServerException extends ServerException {
  constructor() {
    super(StatusCodes.INTERNAL_SERVER_ERROR, "Error from the server");
  }
}

export class NotFoundException extends ClientException {
  constructor(public readonly resource?: string) {
    super(StatusCodes.NOT_FOUND, `Resource not found ${resource}`);
  }
}

export class UnauthorizedException extends ClientException {
  constructor(public readonly resource?: string) {
    super(StatusCodes.UNAUTHORIZED, `You are not authenticated because the token ${resource}`);
  }
}

