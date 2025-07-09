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

const GenerateWeeklyScheduleInputSchema = z.object({
  staff: z.array(StaffMemberSchema).describe("A list of all available staff members to choose from."),
  roles: z.array(RoleSchema).describe("A list of all roles and their hourly staffing requirements."),
  customRules: z.string().optional().describe("Optional custom rules to override the default operational requirements and instructions."),
  existingShifts: z.array(ShiftSchema).optional().describe("A list of existing shifts that should be preserved. The AI should schedule around these to ensure rules like the 5-day work week are met."),
  daysToGenerate: z.array(z.number()).describe("An array of days (0-6 for Sun-Sat) to generate a schedule for."),
});
export type GenerateWeeklyScheduleInput = z.infer<typeof GenerateWeeklyScheduleInputSchema>;

const GenerateWeeklyScheduleOutputSchema = z.object({
  schedule: z.array(ShiftSchema).describe("The generated weekly schedule, as a list of shift assignments."),
  reasoning: z.string().describe('A summary of how the schedule was created and how it meets the requirements.'),
});
export type GenerateWeeklyScheduleOutput = z.infer<typeof GenerateWeeklyScheduleOutputSchema>;

export async function generateWeeklySchedule(input: GenerateWeeklyScheduleInput): Promise<GenerateWeeklyScheduleOutput> {
  const rules = input.customRules || defaultRules;
  
  const prompt = `You are an expert AI scheduler for a customer support team. Your task is to generate a shift schedule for the following days: ${input.daysToGenerate.join(', ')} (Sunday=0, Saturday=6).

${rules}

${input.existingShifts ? `You must take into account the existing schedule for the entire week to ensure staff members do not work more than 5 days. Here are the shifts already assigned:
${input.existingShifts.map(shift => `- Staff ${shift.staffId} is scheduled on Day ${shift.day} from ${shift.startTime} to ${shift.endTime}.`).join('\n')}` : ''}

Generate new shift assignments ONLY for the days specified in 'daysToGenerate'.
Do not create shifts for any other day.
The generated shifts should be combined with the existing shifts to form a complete schedule.
Ensure that the total work days for any staff member (including existing shifts) does not exceed 5 days for the entire week.

Roles and Staffing Needs:
${input.roles.map(role => `- Role: ${role.name} (ID: ${role.id}) requires ${role.requiredAgents} agents on duty every hour.`).join('\n')}

Available Staff:
${input.staff.map(staff => `- Staff ID: ${staff.id}, Name: ${staff.name}, Skills: ${staff.skills.join(', ')}, Availability Notes: ${staff.availability}`).join('\n')}

Please respond with a JSON object containing:
- schedule: array of shift objects with id, day, startTime, endTime, roleId, staffId
- reasoning: string explaining how the schedule meets requirements

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

  try {
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

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Google AI API');
    }

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Add unique IDs to each shift object after generation
    if (result.schedule) {
      result.schedule.forEach((shift: any) => {
        shift.id = `shift-${uuidv4()}`;
      });
    }

    return result as GenerateWeeklyScheduleOutput;
  } catch (error) {
    console.error('Error generating schedule:', error);
    // Return a fallback response
    return {
      schedule: [],
      reasoning: 'Failed to generate schedule due to an error. Please try again.'
    };
  }
}
