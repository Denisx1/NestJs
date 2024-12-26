/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function isStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const passwordRegex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
          return typeof value === 'string' && passwordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return (
            'Password must be strong: ' +
            'at least 8 characters (e.g., "Password123"), ' + // Пример для минимальной длины
            'one uppercase letter (e.g., "Password123"), ' + // Пример для заглавной буквы
            'one number (e.g., "Password123"), ' + // Пример для цифры
            'and one special character (e.g., "Password123!").' // Пример для спецсимволаƒ
          );
        },
      },
    });
  };
}
