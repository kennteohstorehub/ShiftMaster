'use server';

/**
 * @fileOverview An AI agent that generates a full weekly shift schedule.
 *
 * - generateWeeklySchedule - A function that generates a schedule based on operational requirements.
 * - GenerateWeeklyScheduleInput - The input type for the function.
 * - GenerateWeeklyScheduleOutput - The return type for the function.
 */

import {z} from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { defaultRules } from './rules';
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import type { LeaveRequest } from '@/lib/types';

const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.string()),
  availability: z.string(),
});

const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    requiredAgents: z.number().describe('Number of agents required for this role at any given hour.'),
});

const ShiftSchema = z.object({
    id: z.string(),
    day: z.number().describe('Day of the week, where 0 is Sunday and 6 is Saturday.'),
    startTime: z.string().describe('Shift start time in HH:mm format.'),
    endTime: z.string().describe('Shift end time in HH:mm format.'),
    roleId: z.string(),
    staffId: z.string(),
});

const LeaveRequestSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  type: z.enum(['sick', 'vacation', 'medical', 'personal', 'emergency', 'maternity', 'paternity']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: z.string(),
  approvedBy: z.string().optional(),
  notes: z.string().optional(),
});

const GenerateWeeklyScheduleInputSchema = z.object({
  staff: z.array(StaffMemberSchema).describe("A list of all available staff members to choose from."),
  roles: z.array(RoleSchema).describe("A list of all roles and their hourly staffing requirements."),
  customRules: z.string().optional().describe("Optional custom rules to override the default operational requirements and instructions."),
  existingShifts: z.array(ShiftSchema).optional().describe("A list of existing shifts that should be preserved. The AI should schedule around these to ensure rules like the 5-day work week are met."),
  daysToGenerate: z.array(z.number()).describe("An array of days (0-6 for Sun-Sat) to generate a schedule for."),
  leaveRequests: z.array(LeaveRequestSchema).optional().describe("A list of approved leave requests that affect staff availability."),
  weekStartDate: z.string().optional().describe("The start date of the week being scheduled (ISO format)."),
});

export type GenerateWeeklyScheduleInput = z.infer<typeof GenerateWeeklyScheduleInputSchema>;

const GenerateWeeklyScheduleOutputSchema = z.object({
  schedule: z.array(ShiftSchema).describe("The generated weekly schedule, as a list of shift assignments."),
  reasoning: z.string().describe('A summary of how the schedule was created and how it meets the requirements.'),
});
export type GenerateWeeklyScheduleOutput = z.infer<typeof GenerateWeeklyScheduleOutputSchema>;

/**
 * Utility function to check if a staff member is on leave for a specific day
 */
function isStaffOnLeave(staffId: string, dayDate: Date, leaveRequests: LeaveRequest[]): LeaveRequest | null {
  const approvedLeaves = leaveRequests.filter(leave => 
    leave.staffId === staffId && 
    leave.status === 'approved'
  );

  for (const leave of approvedLeaves) {
    const leaveStart = parseISO(leave.startDate);
    const leaveEnd = parseISO(leave.endDate);
    
    if (isWithinInterval(dayDate, { start: leaveStart, end: leaveEnd })) {
      return leave;
    }
  }
  
  return null;
}

/**
 * Get available staff for specific days, filtering out those on leave
 */
function getAvailableStaff(staff: any[], daysToGenerate: number[], weekStartDate: string, leaveRequests: LeaveRequest[] = []) {
  const weekStart = parseISO(weekStartDate);
  
  return staff.map(member => {
    const unavailableDays: number[] = [];
    const leaveInfo: string[] = [];
    
    daysToGenerate.forEach(dayNumber => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + dayNumber);
      
      const leave = isStaffOnLeave(member.id, dayDate, leaveRequests);
      if (leave) {
        unavailableDays.push(dayNumber);
        leaveInfo.push(`Day ${dayNumber}: ${leave.type} leave (${leave.reason || 'No reason provided'})`);
      }
    });
    
    return {
      ...member,
      unavailableDays,
      leaveInfo: leaveInfo.length > 0 ? leaveInfo.join('; ') : undefined
    };
  });
}

export async function generateWeeklySchedule(input: GenerateWeeklyScheduleInput): Promise<GenerateWeeklyScheduleOutput> {
  const rules = input.customRules || defaultRules;
  const leaveRequests = input.leaveRequests || [];
  const weekStartDate = input.weekStartDate || format(startOfWeek(new Date()), 'yyyy-MM-dd');
  
  console.log('🔍 Starting AI schedule generation with input:', {
    staffCount: input.staff.length,
    rolesCount: input.roles.length,
    daysToGenerate: input.daysToGenerate,
    existingShiftsCount: input.existingShifts?.length || 0,
    leaveRequestsCount: leaveRequests.length,
    hasCustomRules: !!input.customRules,
    weekStartDate
  });
  
  // Get staff availability considering leave requests
  const availableStaff = getAvailableStaff(input.staff, input.daysToGenerate, weekStartDate, leaveRequests);
  
  // Filter out staff who are completely unavailable for the days being generated
  const staffWithAvailability = availableStaff.filter(member => 
    input.daysToGenerate.some(day => !member.unavailableDays.includes(day))
  );
  
  console.log('📊 Staff availability analysis:', {
    totalStaff: input.staff.length,
    staffWithAvailability: staffWithAvailability.length,
    staffOnLeave: availableStaff.filter(s => s.unavailableDays.length > 0).length
  });

  // Build leave constraints for the prompt
  const leaveConstraints = availableStaff
    .filter(member => member.leaveInfo)
    .map(member => `- ${member.name} (${member.id}): ${member.leaveInfo}`)
    .join('\n');

  const prompt = `You are an expert AI scheduler for a customer support team. Your task is to generate a shift schedule for the following days: ${input.daysToGenerate.join(', ')} (Sunday=0, Saturday=6).

${rules}

${input.existingShifts ? `You must take into account the existing schedule for the entire week to ensure staff members do not work more than 5 days. Here are the shifts already assigned:
${input.existingShifts.map(shift => `- Staff ${shift.staffId} is scheduled on Day ${shift.day} from ${shift.startTime} to ${shift.endTime}.`).join('\n')}` : ''}

${leaveConstraints ? `CRITICAL: The following staff members are on approved leave and CANNOT be scheduled:
${leaveConstraints}

You must NOT assign shifts to staff members on their leave days. This is mandatory and non-negotiable.` : ''}

Generate new shift assignments ONLY for the days specified in 'daysToGenerate'.
Do not create shifts for any other day.
The generated shifts should be combined with the existing shifts to form a complete schedule.
Ensure that the total work days for any staff member (including existing shifts) does not exceed 5 days for the entire week.

Roles and Staffing Needs:
${input.roles.map(role => `- Role: ${role.name} (ID: ${role.id}) requires ${role.requiredAgents} agents on duty every hour.`).join('\n')}

Available Staff (considering leave constraints):
${staffWithAvailability.map(staff => `- Staff ID: ${staff.id}, Name: ${staff.name}, Skills: ${staff.skills.join(', ')}, Availability Notes: ${staff.availability}${staff.unavailableDays.length > 0 ? `, UNAVAILABLE on days: ${staff.unavailableDays.join(', ')}` : ''}`).join('\n')}

Please respond with a JSON object containing:
- schedule: array of shift objects with id, day, startTime, endTime, roleId, staffId
- reasoning: string explaining how the schedule meets requirements and handles leave constraints

The response must be valid JSON that matches this schema:
{
  "schedule": [
    {
      "id": "string",
      "day": number,
      "startTime": "HH:mm",
      "endTime": "HH:mm", 
      "roleId": "string",
      "staffId": "string"
    }
  ],
  "reasoning": "string"
}`;

  console.log('📝 Generated prompt length:', prompt.length);
  console.log('🔑 API Key exists:', !!process.env.GOOGLE_AI_API_KEY);

  try {
    console.log('🚀 Making API request to Google AI...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google AI API error details:', errorText);
      throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Raw API response:', JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('❌ No text in API response:', data);
      throw new Error('No response from Google AI API');
    }

    console.log('📄 AI response text:', text);

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response text:', text);
      throw new Error('No JSON found in response');
    }

    console.log('🔍 Extracted JSON:', jsonMatch[0]);
    const result = JSON.parse(jsonMatch[0]);
    
    // Add unique IDs to each shift object after generation
    if (result.schedule) {
      result.schedule.forEach((shift: any) => {
        shift.id = `shift-${uuidv4()}`;
      });
    }

    // Validate that no staff on leave were scheduled
    const invalidShifts = result.schedule?.filter((shift: any) => {
      const weekStart = parseISO(weekStartDate);
      const shiftDate = new Date(weekStart);
      shiftDate.setDate(weekStart.getDate() + shift.day);
      return isStaffOnLeave(shift.staffId, shiftDate, leaveRequests);
    }) || [];

    if (invalidShifts.length > 0) {
      console.warn('⚠️ AI scheduled staff on leave days:', invalidShifts);
      // Filter out invalid shifts
      result.schedule = result.schedule?.filter((shift: any) => {
        const weekStart = parseISO(weekStartDate);
        const shiftDate = new Date(weekStart);
        shiftDate.setDate(weekStart.getDate() + shift.day);
        return !isStaffOnLeave(shift.staffId, shiftDate, leaveRequests);
      });
    }

    console.log('✅ Successfully generated schedule with', result.schedule?.length || 0, 'shifts');
    return result as GenerateWeeklyScheduleOutput;
  } catch (error) {
    console.error('💥 Error generating schedule:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return a fallback response with more detailed error info
    return {
      schedule: [],
      reasoning: `Failed to generate schedule due to an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
    };
  }
}
