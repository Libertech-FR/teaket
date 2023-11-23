import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

export function IsEnveloppePartDto(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEnveloppePartDto',
      target: object.constructor,
      propertyName: propertyName + '.senders',
      constraints: [propertyName],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return typeof value === 'object' && value.hasOwnProperty('sender') // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    })
  }
}
