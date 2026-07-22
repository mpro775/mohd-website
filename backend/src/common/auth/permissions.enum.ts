export enum Permission {
  // Users & Roles
  MANAGE_USERS = 'manage_users',

  // Settings & System
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',

  // Blog Taxonomy
  MANAGE_TAXONOMY = 'manage_taxonomy',

  // Blog Posts
  CREATE_POSTS = 'create_posts',
  EDIT_POSTS = 'edit_posts',
  PUBLISH_POSTS = 'publish_posts',
  DELETE_POSTS = 'delete_posts',
  PERMANENT_DELETE_POSTS = 'permanent_delete_posts',

  // Content Modules
  MANAGE_PORTFOLIO = 'manage_portfolio',
  MANAGE_MEDIA = 'manage_media',
  MANAGE_CONTACT_MESSAGES = 'manage_contact_messages',
}
