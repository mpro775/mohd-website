import { UserRole } from '../../modules/users/schemas/user.schema';
import { Permission } from './permissions.enum';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.EDITOR]: [
    Permission.MANAGE_TAXONOMY,
    Permission.CREATE_POSTS,
    Permission.EDIT_POSTS,
    Permission.PUBLISH_POSTS,
    Permission.DELETE_POSTS,
    Permission.MANAGE_PORTFOLIO,
    Permission.MANAGE_MEDIA,
    Permission.MANAGE_CONTACT_MESSAGES,
  ],
  [UserRole.PUBLISHER]: [
    Permission.EDIT_POSTS,
    Permission.PUBLISH_POSTS,
    Permission.MANAGE_TAXONOMY,
    Permission.MANAGE_MEDIA,
  ],
  [UserRole.REVIEWER]: [Permission.EDIT_POSTS, Permission.MANAGE_MEDIA],
  [UserRole.AUTHOR]: [
    Permission.CREATE_POSTS,
    Permission.EDIT_POSTS,
    Permission.MANAGE_MEDIA,
  ],
};
