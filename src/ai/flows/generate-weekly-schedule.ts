'use server';

/**
 * @fileOverview An AI agent that generates a full weekly shift schedule.
 *
 * - generateWeeklySchedule - A function that generates a schedule based on operational requirements.
 * - GenerateWeeklyScheduleInput - The input type for the function.
 * - GenerateWeeklyScheduleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
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
  const result = await generateWeeklyScheduleFlow(input);
  // Add unique IDs to each shift object after generation
  if (result.schedule) {
    result.schedule.forEach(shift => {
      shift.id = `shift-${uuidv4()}`;
    });
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateWeeklySchedulePrompt',
  input: {schema: GenerateWeeklyScheduleInputSchema},
  output: {schema: GenerateWeeklyScheduleOutputSchema},
  prompt: `You are an expert AI scheduler for a customer support team. Your task is to generate a shift schedule for the following days: {{#each daysToGenerate}}Day {{.}}{{/each}} (Sunday=0, Saturday=6).

  {{#if customRules}}
  {{{customRules}}}
  {{else}}
  ${defaultRules}
  {{/if}}
  
  {{#if existingShifts}}
  You must take into account the existing schedule for the entire week to ensure staff members do not work more than 5 days. Here are the shifts already assigned:
  {{#each existingShifts}}
  - Staff {{staffId}} is scheduled on Day {{day}} from {{startTime}} to {{endTime}}.
  {{/each}}
  {{/if}}

  Generate new shift assignments ONLY for the days specified in 'daysToGenerate'.
  Do not create shifts for any other day.
  The generated shifts should be combined with the existing shifts to form a complete schedule.
  Ensure that the total work days for any staff member (including existing shifts) does not exceed 5 days for the entire week.

  Roles and Staffing Needs:
  {{#each roles}}
  - Role: {{name}} (ID: {{id}}) requires {{requiredAgents}} agents on duty every hour.
  {{/each}}

  Available Staff:
  {{#each staff}}
  - Staff ID: {{id}}, Name: {{name}}, Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}, Availability Notes: {{{availability}}}
  {{/each}}
  `,
});

const generateWeeklyScheduleFlow = ai.defineFlow(
  {
    name: 'generateWeeklyScheduleFlow',
    inputSchema: GenerateWeeklyScheduleInputSchema,
    outputSchema: GenerateWeeklyScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
