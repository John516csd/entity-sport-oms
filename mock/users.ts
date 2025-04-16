import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock user data
const mockUsers = [
  {
    id: 101,
    name: '张三',
    mobile: '13900001111',
    email: 'zhangsan@example.com',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    status: 'active',
    created_at: '2023-01-01T08:00:00',
  },
  {
    id: 102,
    name: '李四',
    mobile: '13900002222',
    email: 'lisi@example.com',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    status: 'active',
    created_at: '2023-01-02T09:00:00',
  },
  {
    id: 103,
    name: '王五',
    mobile: '13900003333',
    email: 'wangwu@example.com',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    status: 'inactive',
    created_at: '2023-01-03T10:00:00',
  },
];

// Helper function to filter users based on query parameters
const filterUsers = (users: any[], query: any) => {
  let result = [...users];

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    result = result.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.mobile.includes(query.search) ||
        user.email.toLowerCase().includes(searchLower),
    );
  }

  if (query.status) {
    result = result.filter((user) => user.status === query.status);
  }

  return result;
};

// Admin user for login
const adminUser = {
  id: 999,
  name: '管理员',
  mobile: 'admin',
  email: 'admin@example.com',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  status: 'active',
  created_at: '2022-01-01T00:00:00',
};

export default {
  // Get all users with filters
  'GET /api/admin/users': (req: Request, res: Response) => {
    const { query } = req;

    // Apply filters
    const filteredUsers = filterUsers(mockUsers, query);

    // Pagination
    const skip = Number(query.skip) || 0;
    const limit = Number(query.limit) || 10;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    res.send({
      code: 200,
      message: 'success',
      data: {
        total: filteredUsers.length,
        users: paginatedUsers,
      },
      request_id: uuidv4(),
    });
  },

  // Login API
  'POST /api/auth/login': (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin123') {
      res.send({
        code: 200,
        message: 'success',
        data: {
          access_token: 'mock-token-' + uuidv4(),
          token_type: 'Bearer',
          user: adminUser,
        },
        request_id: uuidv4(),
      });
    } else {
      res.status(401).send({
        code: 401,
        message: '用户名或密码错误',
        data: null,
        request_id: uuidv4(),
      });
    }
  },

  // Logout API
  'POST /api/auth/logout': (req: Request, res: Response) => {
    res.send({
      code: 200,
      message: 'success',
      data: {},
      request_id: uuidv4(),
    });
  },

  // Current user API
  'GET /api/auth/currentUser': (req: Request, res: Response) => {
    res.send({
      code: 200,
      message: 'success',
      data: adminUser,
      request_id: uuidv4(),
    });
  },
};
