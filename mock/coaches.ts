import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock coach data
const mockCoaches = [
  {
    id: 1,
    name: '张教练',
    mobile: '13800138001',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    status: 'active',
    specialization: '力量训练',
    created_at: '2023-01-01T08:00:00',
  },
  {
    id: 2,
    name: '李教练',
    mobile: '13800138002',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    status: 'active',
    specialization: '有氧训练',
    created_at: '2023-01-02T09:00:00',
  },
  {
    id: 3,
    name: '王教练',
    mobile: '13800138003',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    status: 'inactive',
    specialization: '瑜伽',
    created_at: '2023-01-03T10:00:00',
  },
];

// Helper function to filter coaches based on query parameters
const filterCoaches = (coaches: any[], query: any) => {
  let result = [...coaches];

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    result = result.filter(
      (coach) =>
        coach.name.toLowerCase().includes(searchLower) ||
        coach.mobile.includes(query.search) ||
        coach.specialization.toLowerCase().includes(searchLower),
    );
  }

  if (query.status) {
    result = result.filter((coach) => coach.status === query.status);
  }

  return result;
};

export default {
  // Get all coaches with filters
  'GET /api/admin/coaches': (req: Request, res: Response) => {
    const { query } = req;

    // Apply filters
    const filteredCoaches = filterCoaches(mockCoaches, query);

    // Pagination
    const skip = Number(query.skip) || 0;
    const limit = Number(query.limit) || 10;
    const paginatedCoaches = filteredCoaches.slice(skip, skip + limit);

    res.send({
      code: 200,
      message: 'success',
      data: {
        total: filteredCoaches.length,
        coaches: paginatedCoaches,
      },
      request_id: uuidv4(),
    });
  },
};
