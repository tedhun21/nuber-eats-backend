import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllodwedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllodwedRoles[]) => SetMetadata('roles', roles);
