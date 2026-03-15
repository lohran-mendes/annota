import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidAnswerIndex(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidAnswerIndex',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'correctAnswerIndex must be less than the number of alternatives',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const alternatives = obj['alternatives'];
          if (!Array.isArray(alternatives) || typeof value !== 'number')
            return false;
          return value >= 0 && value < alternatives.length;
        },
      },
    });
  };
}
