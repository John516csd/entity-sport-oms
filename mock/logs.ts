import { Request, Response } from 'express';

// Mock logs data based on the provided sample
const mockLogs = [
  {
    timestamp: '2025-04-15T08:51:39',
    level: 'info',
    details: {
      uid: '7446e84a-8f3b-439a-b5c7-1fa621ecdd19',
      type_id: 5,
      user_id: 1,
      admin_id: 2,
      start_date: '2025-04-15T08:51:39.244319',
      validity_days: 1,
      total_sessions: 1,
    },
    message: 'Membership created for user ID 1 by admin ID 2',
    id: 9,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:50:45',
    level: 'info',
    details: {
      type_id: 3,
      user_id: 1,
      admin_id: 2,
      start_date: '2025-04-15T07:50:45.223239',
      validity_days: 99999,
      total_sessions: 10,
    },
    message: 'Membership created for user ID 1 by admin ID 2',
    id: 8,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:50:05',
    level: 'info',
    details: {
      reason: '',
      user_id: 1,
      admin_id: 2,
    },
    message: 'Membership ID 1 revoked by admin ID 2',
    id: 7,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:49:56',
    level: 'info',
    details: {
      reason: '',
      user_id: 1,
      admin_id: 2,
    },
    message: 'Membership ID 4 revoked by admin ID 2',
    id: 6,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:49:53',
    level: 'info',
    details: {
      reason: '',
      user_id: 1,
      admin_id: 2,
    },
    message: 'Membership ID 3 revoked by admin ID 2',
    id: 5,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:48:56',
    level: 'info',
    details: {
      type_id: 4,
      user_id: 1,
      admin_id: 2,
      start_date: '2025-04-15T07:48:56.326736',
      validity_days: 99999,
      total_sessions: 10,
    },
    message: 'Membership created for user ID 1 by admin ID 2',
    id: 4,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:48:42',
    level: 'info',
    details: {
      type_id: 3,
      user_id: 1,
      admin_id: 2,
      start_date: '2025-04-15T07:48:42.053405',
      validity_days: 999,
      total_sessions: 10,
    },
    message: 'Membership created for user ID 1 by admin ID 2',
    id: 3,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-15T07:47:58',
    level: 'info',
    details: {
      type_id: 1,
      user_id: 1,
      admin_id: 2,
      start_date: '2025-04-15T07:47:58.112855',
      validity_days: 30,
      total_sessions: 30,
    },
    message: 'Membership created for user ID 1 by admin ID 2',
    id: 2,
    log_type: 'membership',
    user_id: 2,
  },
  {
    timestamp: '2025-04-14T09:10:30',
    level: 'info',
    details: {
      reason: '送多了',
      user_id: 1,
      admin_id: 2,
    },
    message: 'Membership ID 2 revoked by admin ID 2',
    id: 1,
    log_type: 'membership',
    user_id: 2,
  },
];

// Basic search and filter implementation for mock API
const filterLogs = (logs: any[], params: any) => {
  let result = [...logs];

  // Filter by level
  if (params.level) {
    result = result.filter((log) => log.level === params.level);
  }

  // Filter by log_type
  if (params.log_type) {
    result = result.filter((log) => log.log_type === params.log_type);
  }

  // Filter by user_id
  if (params.user_id) {
    result = result.filter(
      (log) =>
        log.user_id === Number(params.user_id) ||
        (log.details && log.details.user_id === Number(params.user_id)),
    );
  }

  // Filter by date range
  if (params.start_date) {
    const startDate = new Date(params.start_date);
    result = result.filter((log) => new Date(log.timestamp) >= startDate);
  }

  if (params.end_date) {
    const endDate = new Date(params.end_date);
    endDate.setHours(23, 59, 59, 999); // End of the day
    result = result.filter((log) => new Date(log.timestamp) <= endDate);
  }

  // Search by keyword (in message or details)
  if (params.search) {
    const keyword = params.search.toLowerCase();
    result = result.filter(
      (log) =>
        log.message.toLowerCase().includes(keyword) ||
        JSON.stringify(log.details).toLowerCase().includes(keyword),
    );
  }

  return result;
};

export default {
  'GET /api/admin/logs': (req: Request, res: Response) => {
    const { query } = req;

    // Apply filters
    const filteredLogs = filterLogs(mockLogs, query);

    // Pagination
    const skip = Number(query.skip) || 0;
    const limit = Number(query.limit) || 10;
    const paginatedLogs = filteredLogs.slice(skip, skip + limit);

    res.send({
      code: 200,
      message: 'success',
      data: {
        total: filteredLogs.length,
        logs: paginatedLogs,
      },
      request_id: 'b7ad9fdb-97d6-48a2-a9f5-61e8fb06919d',
    });
  },
};
