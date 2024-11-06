import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParamId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    return parseInt(context.switchToHttp().getRequest().params.id);
  },
);
