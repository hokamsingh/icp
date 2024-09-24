import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function TransformArgs() {
  return function (
    target: any,
    propertyName: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const typedParams: Record<string, any> = Reflect.getOwnMetadata(
        'transformtype',
        target,
        propertyName,
      );

      const transformedArgs = args.map((arg, argIndex) => {
        if (arg && typedParams[argIndex]) {
          switch (typedParams[argIndex]) {
            case Number:
            case String:
            case RegExp:
            case Date:
              return typedParams[argIndex](arg);
            case Boolean:
              return arg === 'false' || arg === '0' ? false : Boolean(arg);
            default:
              arg = plainToInstance(typedParams[argIndex], arg, {
                enableImplicitConversion: true,
              });
              const errors = validateSync(arg, {
                whitelist: true,
                forbidUnknownValues: true,
              });
              if (errors.length) {
                const err = new Error('TransformArgs validation error');
                err.cause = JSON.stringify(errors);
                throw err;
              }
              return arg;
          }
        } else {
          return arg;
        }
      });

      return originalMethod.apply(this, transformedArgs);
    };
  };
}
