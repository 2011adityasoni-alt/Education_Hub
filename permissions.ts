/** Single source of truth for RBAC. Used by guards, decorators and the reference seed. */
export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  TEACHER_MANAGE: 'teacher:manage',
  COURSE_READ: 'course:read',
  COURSE_WRITE: 'course:write',
  COURSE_PUBLISH: 'course:publish',
  BATCH_MANAGE: 'batch:manage',
  LESSON_WRITE: 'lesson:write',
  MATERIAL_WRITE: 'material:write',
  LIVE_MANAGE: 'live:manage',
  TEST_WRITE: 'test:write',
  TEST_READ_KEYS: 'test:read_keys',
  DOUBT_ANSWER: 'doubt:answer',
  PAYMENT_READ: 'payment:read',
  PAYMENT_REFUND: 'payment:refund',
  COUPON_MANAGE: 'coupon:manage',
  NOTIFICATION_SEND: 'notification:send',
  TICKET_MANAGE: 'ticket:manage',
  CENTRE_MANAGE: 'centre:manage',
  REPORT_READ: 'report:read',
  ROLE_MANAGE: 'role:manage',
  AUDIT_READ: 'audit:read',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_KEYS = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  SUPPORT: 'support',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;
export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];

const P = PERMISSIONS;
/** Students hold no staff permissions; their access is ownership/enrollment-based and checked in services. */
export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  student: [],
  teacher: [P.COURSE_READ, P.COURSE_WRITE, P.LESSON_WRITE, P.MATERIAL_WRITE, P.LIVE_MANAGE,
    P.TEST_WRITE, P.TEST_READ_KEYS, P.DOUBT_ANSWER],
  support: [P.USER_READ, P.PAYMENT_READ, P.TICKET_MANAGE, P.DOUBT_ANSWER, P.NOTIFICATION_SEND],
  admin: ALL_PERMISSIONS.filter((p) => p !== P.ROLE_MANAGE),
  super_admin: ALL_PERMISSIONS,
};
