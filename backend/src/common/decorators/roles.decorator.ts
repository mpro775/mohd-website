import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/schemas/user.schema';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
