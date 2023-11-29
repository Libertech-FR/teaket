import { Logger } from '@nestjs/common'
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

export function IsEnveloppePartDto(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsEnveloppePartDto',
      target: object.constructor,
      propertyName: propertyName + '.senders',
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return typeof relatedValue === 'object' && relatedValue.hasOwnProperty('senders')
        },
      },
    })
  }
}
