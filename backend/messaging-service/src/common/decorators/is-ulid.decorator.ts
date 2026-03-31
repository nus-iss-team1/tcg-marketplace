import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { isValid } from "ulid";

export function IsULID(validationOptions?: ValidationOptions) {
  return function IsULID(object: object, propertyName: string) {
    registerDecorator({
      name: "isULID",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: function (value: unknown) {
          if (typeof value !== "string") {
            return false;
          }

          return isValid(value);
        },
        defaultMessage: function (args: ValidationArguments) {
          return `${args.property} must be a valid ULID`;
        }
      }
    });
  };
}
