import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiError } from 'src/errors/errorhandler';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // Reflector используется для получения метаданных

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
      // Получаем список ролей, которые указаны для маршрута
      if (!requiredRoles) return true;

      const { authedUser } = context.switchToHttp().getRequest();
      const isAuth = authedUser.userId.roles.some((role) =>
        requiredRoles.includes(role.name),
      );
      if (!isAuth) return false;

      return true;
    } catch (error) {
      throw new ApiError(error.message, error.status || 500);
    }
  }
}
