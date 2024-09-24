export function ArgType(cls: new (...args: any[]) => any) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingTypedParams: Record<string, any> =
      Reflect.getOwnMetadata('transformtype', target, propertyKey) || {};
    existingTypedParams[parameterIndex] = cls;

    Reflect.defineMetadata(
      'transformtype',
      existingTypedParams,
      target,
      propertyKey,
    );
  };
}
