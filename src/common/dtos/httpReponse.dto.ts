import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';
import { HttpResponseBodySuccessDto } from './httpResponseBodySuccess.dto';
import { HTTPException } from '@tsed/exceptions';

export class HttpReponseDtos {
    async success<T>(data: HttpResponseBodySuccessDto<T>, res: Response) {
        return res.status(StatusCodes.OK).json(data);
    }
    
    async created<T>(data: HttpResponseBodySuccessDto<T>, res: Response) {
        return res.status(StatusCodes.CREATED).json(data);
    }

    async exception(exceptions: HTTPException, res: Response) {
        return res.status(exceptions.status).json({
            status : exceptions.status,
            message: exceptions.message
        })
    }
}