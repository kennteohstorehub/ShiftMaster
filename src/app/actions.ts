"use server";

import { generateWeeklySchedule } from "@/ai/flows/generate-weekly-schedule";
import type { GenerateWeeklyScheduleInput } from "@/ai/flows/generate-weekly-schedule";

export async function generateWeeklyScheduleAction(input: GenerateWeeklyScheduleInput) {
  try {
    const result = await generateWeeklySchedule(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in generateWeeklyScheduleAction:", error);
    return { success: false, error: "Failed to generate AI schedule. Please try again." };
  }
}
