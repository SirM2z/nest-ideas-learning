import { ReflectMetadata, createParamDecorator } from '@nestjs/common';

// export const User = (...args: string[]) => ReflectMetadata('user', args);
export const User = createParamDecorator((data, req) => {
  return data ? req.user[data] : req.user;
});
