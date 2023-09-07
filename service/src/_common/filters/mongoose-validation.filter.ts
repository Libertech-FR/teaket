import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { Error } from 'mongoose'
import { ValidationError } from 'class-validator'

@Catch(Error.ValidationError, Error.CastError, ValidationError)
export class MongooseValidationFilter implements ExceptionFilter {
  public catch(exception: Error.ValidationError | Error.CastError | ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    Logger.debug(exception['message'], 'MongooseValidationFilter')
    let debug = {}
    if (process.env.NODE_ENV !== 'production' && request.query['debug']) {
      debug['_exception'] = exception
    }
    response.status(HttpStatus.NOT_ACCEPTABLE).json(
      HttpException.createBody(
        {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: exception['message'],
          validations: this.getValidationErrors(exception),
          ...debug,
        },
        exception.constructor.name,
        HttpStatus.NOT_ACCEPTABLE,
      ),
    )
  }

  protected getValidationErrors(err: Error.ValidationError | Error.CastError | ValidationError): Record<string, any> {
    const validations = {}
    if (err instanceof Error.ValidationError) {
      for (const key in err.errors) {
        if (err.errors[key]['constraints']) {
          Object.keys(err.errors[key]['constraints']).forEach((ckey) => {
            const property = err.errors[key]['property']
            validations[`${key}.${property}`] = err.errors[key]['constraints'][ckey]
          })
          continue
        }
        validations[key] = err.errors[key].message
      }
    } else if (err instanceof Error.CastError) {
      validations[err.path] = err.message
    }
    return validations
  }
}
