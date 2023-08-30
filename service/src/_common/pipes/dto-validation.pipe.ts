import { BadRequestException, HttpStatus, ValidationPipe, ValidationError, Logger } from '@nestjs/common'

export class DtoValidationPipe extends ValidationPipe {
  public constructor() {
    super({
      transform: true,
      exceptionFactory: (errors) => {
        const validations = {}
        const errorsMessage = []
        errors.forEach((error: ValidationError) => {
          if (error.constraints) {
            Object.values(error.constraints).forEach((value) => {
              validations[error.property] = value
              errorsMessage.push(`${error.property}: ${value}`)
            })
          }
          if (error.children.length > 0) {
            validations[error.property] = {}
            error.children.forEach((childError: ValidationError) => {
              if (childError.constraints) {
                Object.values(childError.constraints).forEach((value) => {
                  validations[error.property][childError.property] = value
                  errorsMessage.push(`${error.property}.${childError.property}: ${value}`)
                })
              }
            })
          }
        })
        const message = `Validation failed: ${errorsMessage.join(', ')}`
        Logger.debug(message, 'DtoValidationPipe')
        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message,
          validations,
        })
      },
    })
  }
}
