import { SetMetadata } from '@nestjs/common';

// Декоратор принимает список ролей и добавляет их в метаданные маршрута
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
