import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock appointment data
const mockAppointments = [
  {
    id: 1,
    uid: '7446e84a-8f3b-439a-b5c7-1fa621ecdd19',
    membership_id: 1,
    coach_id: 1,
    appointment_start: '2025-04-15T16:00:00',
    appointment_end: '2025-04-15T17:00:00',
    status: 'scheduled', // scheduled, completed, cancelled
    cancellation_note: null,
  },
  {
    id: 2,
    uid: '9c7fcb5d-6e1a-4d3e-8b2f-f5a8d3e7c2b1',
    membership_id: 2,
    coach_id: 2,
    appointment_start: '2025-04-16T10:00:00',
    appointment_end: '2025-04-16T11:00:00',
    status: 'completed',
    cancellation_note: null,
  },
  {
    id: 3,
    uid: 'a2b4c6d8-e0f2-4a6c-8d0e-2f4a6c8e0d2f',
    membership_id: 1,
    coach_id: 3,
    appointment_start: '2025-04-17T14:00:00',
    appointment_end: '2025-04-17T15:00:00',
    status: 'cancelled',
    cancellation_note: '会员临时有事无法参加',
  },
];

// Helper function to filter appointments based on query parameters
const filterAppointments = (appointments: any[], query: any) => {
  let result = [...appointments];

  if (query.membership_id) {
    result = result.filter((item) => item.membership_id === Number(query.membership_id));
  }

  if (query.coach_id) {
    result = result.filter((item) => item.coach_id === Number(query.coach_id));
  }

  if (query.status) {
    result = result.filter((item) => item.status === query.status);
  }

  if (query.start_date) {
    const startDate = new Date(query.start_date);
    result = result.filter((item) => new Date(item.appointment_start) >= startDate);
  }

  if (query.end_date) {
    const endDate = new Date(query.end_date);
    result = result.filter((item) => new Date(item.appointment_start) <= endDate);
  }

  return result;
};

export default {
  // Get all appointments with filters
  'GET /api/admin/appointments': (req: Request, res: Response) => {
    const { query } = req;

    // Apply filters
    const filteredAppointments = filterAppointments(mockAppointments, query);

    // Pagination
    const skip = Number(query.skip) || 0;
    const limit = Number(query.limit) || 10;
    const paginatedAppointments = filteredAppointments.slice(skip, skip + limit);

    res.send({
      code: 200,
      message: 'success',
      data: {
        total: filteredAppointments.length,
        appointments: paginatedAppointments,
      },
      request_id: uuidv4(),
    });
  },
};
