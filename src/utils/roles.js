const ROLES = {
  USUARIO: 'usuario',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

const ROLE_LEVEL = {
  [ROLES.USUARIO]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPERADMIN]: 3
};

const ROLES_VALIDOS = Object.values(ROLES);

const hasMinRole = (rol, minRole) => {
  const userLevel = ROLE_LEVEL[rol] || 0;
  const required = ROLE_LEVEL[minRole] || Infinity;
  return userLevel >= required;
};

const isStaff = (rol) => hasMinRole(rol, ROLES.ADMIN);

const isSuperAdmin = (rol) => rol === ROLES.SUPERADMIN;

module.exports = {
  ROLES,
  ROLE_LEVEL,
  ROLES_VALIDOS,
  hasMinRole,
  isStaff,
  isSuperAdmin
};
