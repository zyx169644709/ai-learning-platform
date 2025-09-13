export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    LOGOUT: '/api/auth/logout'
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: '/api/users/:id',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
    PREFERENCES: '/api/users/:id/preferences'
  },
  CODE_SNIPPETS: {
    LIST: '/api/code-snippets',
    CREATE: '/api/code-snippets',
    DETAIL: '/api/code-snippets/:id',
    UPDATE: '/api/code-snippets/:id',
    DELETE: '/api/code-snippets/:id'
  },
  LEARNING_PROGRESS: {
    LIST: '/api/learning-progress',
    UPDATE: '/api/learning-progress/:chapterId',
    STATS: '/api/learning-progress/stats'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const API_MESSAGES = {
  SUCCESS: {
    USER_CREATED: '用户创建成功',
    USER_UPDATED: '用户信息更新成功',
    USER_DELETED: '用户删除成功',
    LOGIN_SUCCESS: '登录成功',
    LOGOUT_SUCCESS: '退出登录成功'
  },
  ERROR: {
    USER_NOT_FOUND: '用户不存在',
    USER_ALREADY_EXISTS: '用户已存在',
    INVALID_CREDENTIALS: '用户名或密码错误',
    UNAUTHORIZED: '未授权访问',
    FORBIDDEN: '禁止访问',
    INTERNAL_ERROR: '服务器内部错误'
  }
};

