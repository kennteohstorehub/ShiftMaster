export const defaultRules = `Operational Requirements:
- The team operates every day from 09:00 to 21:00.
- There are three standard shifts: 09:00-18:00, 11:00-20:00, and 12:00-21:00.
- Each staff member must work exactly 5 days per week.
- You must meet the required number of agents for each role during all operational hours.

Instructions:
1.  Create a 7-day schedule, assigning staff to one of the three shifts (09:00-18:00, 11:00-20:00, 12:00-21:00) for each of their 5 working days.
2.  For each hour between 09:00 and 21:00, ensure the number of assigned staff for each role meets the 'requiredAgents' count.
3.  Distribute the two rest days for each staff member across the week.
4.  Consider staff skills when assigning roles. For example, a staff member with 'LiveChat' in their skills is a good candidate for the LiveChat role.
5.  Pay attention to staff availability notes but prioritize meeting the coverage requirements.
6.  The final output must be a flat list of shift assignments in the 'schedule' array. Each entry represents one staff member's shift for one day. A staff member working 5 days will have 5 entries in the array.
7.  Provide a brief reasoning for your generated schedule, explaining how it meets the core requirements.`;
