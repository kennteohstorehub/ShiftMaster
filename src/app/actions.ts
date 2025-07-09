"use server";

import { generateWeeklySchedule } from "@/ai/flows/generate-weekly-schedule";
import type { GenerateWeeklyScheduleInput } from "@/ai/flows/generate-weekly-schedule";

export async function generateWeeklyScheduleAction(input: GenerateWeeklyScheduleInput) {
  console.log('🎯 generateWeeklyScheduleAction called with:', {
    staffCount: input.staff?.length || 0,
    rolesCount: input.roles?.length || 0,
    daysToGenerate: input.daysToGenerate,
    existingShiftsCount: input.existingShifts?.length || 0,
    hasCustomRules: !!input.customRules
  });

  try {
    const result = await generateWeeklySchedule(input);
    console.log('✅ generateWeeklyScheduleAction success:', {
      scheduleLength: result.schedule?.length || 0,
      reasoningLength: result.reasoning?.length || 0
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("💥 Error in generateWeeklyScheduleAction:", error);
    console.error("💥 Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return { success: false, error: `Failed to generate AI schedule: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` };
  }
}
