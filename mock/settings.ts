import { Request, Response } from 'express';

// Mock data for system settings
const mockSettings = {
  system_name: '健身房管理系统',
  business_hours: {
    start: '08:00',
    end: '22:00',
  },
  appointment_duration: 60,
  max_appointments_per_day: 8,
  max_appointments_per_coach: 2,
  cancellation_policy: {
    hours_before: 24,
    refund_percentage: 100,
  },
};

export default {
  // Get system settings
  'GET /api/admin/settings': (req: Request, res: Response) => {
    res.send({
      code: 200,
      message: 'success',
      data: mockSettings,
      request_id: '81ea8cbb-4e07-42f0-b233-b8bb69760e62',
    });
  },

  // Update system settings
  'PUT /api/admin/settings': (req: Request, res: Response) => {
    // In a real scenario, we would update the settings in the database
    // For the mock, we'll just return the request body as the updated settings
    const updatedSettings = req.body;

    // Update our mock data
    Object.assign(mockSettings, updatedSettings);

    res.send({
      code: 200,
      message: 'success',
      data: mockSettings,
      request_id: '81ea8cbb-4e07-42f0-b233-b8bb69760e62',
    });
  },
};
