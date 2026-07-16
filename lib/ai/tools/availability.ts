import { z } from 'zod';
import { ToolDefinition } from './registry';

export const AvailabilityTool: ToolDefinition = {
  name: 'check_available_slots',
  description: 'Check available time slots for appointments or site visits.',
  parameters: z.object({
    date: z.string().optional().describe('Preferred date for the appointment (YYYY-MM-DD)'),
  }),
  execute: async ({ date }, { agent }) => {
    // Stub: To be implemented in Week 5
    return {
      message: 'Here are the available slots.',
      available_slots: [
        'Tomorrow 10 AM',
        'Tomorrow 3 PM',
        'Friday 11 AM'
      ]
    };
  },
};
