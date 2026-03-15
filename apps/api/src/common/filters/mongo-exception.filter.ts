import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';

@Catch(mongoose.Error.CastError, mongoose.Error.ValidationError, MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: mongoose.Error.CastError | mongoose.Error.ValidationError | MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof mongoose.Error.CastError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid ID format: ${exception.value}`,
        error: 'Bad Request',
      });
    }

    if (exception instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(exception.errors).map((e) => e.message);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: messages,
        error: 'Bad Request',
      });
    }

    // MongoDB duplicate key error (E11000)
    if (exception instanceof MongoServerError && exception.code === 11000) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Duplicate key: a record with this value already exists',
        error: 'Conflict',
      });
    }

    // MongoServerError genérico
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error',
      error: 'Internal Server Error',
    });
  }
}
