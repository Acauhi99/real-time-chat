import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

interface ExceptionResponse {
  statusCode?: number;
  error?: string;
  message: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | string
      | ExceptionResponse;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: this.getErrorMessage(exceptionResponse),
    });
  }

  private getErrorMessage(
    exceptionTesponse: string | ExceptionResponse
  ): string {
    return typeof exceptionTesponse === "string"
      ? exceptionTesponse
      : exceptionTesponse.message;
  }
}
