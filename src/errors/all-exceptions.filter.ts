import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Если это HttpException, обработать стандартно
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();

      // Если ошибка это объект, а не строка, можно обработать её более детально
      if (typeof message === 'object' && message.hasOwnProperty('message')) {
        return response.status(status).json({
          message: message['message'],
          status,
          path: request.url,
        });
      }

      // Для случая, если ошибка не имеет дополнительных данных
      return response.status(status).json({
        message,
        status,
        path: request.url,
      });
    }

    // Обработка ошибок валидации
    if (exception instanceof Error && exception.name === 'ValidationError') {
      const errorResponse = exception.message || 'Validation failed';
      return response.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: errorResponse,
        path: request.url,
      });
    }

    // Для других ошибок
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: exception.message || 'Internal server error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      path: request.url,
    });
  }
}
