// Mirrors AgentInputStrc.py (SCRUM-18) field-for-field, so no translation layer is
// needed once /api/routines exists.

export interface WorkoutPlanInput {
  goal: string;
  experienceLevel: string;
  daysPerWeek: number;
  sessionLengthMinutes: number;
  equipment: string[];
  limitations: string;
  preferredTrainingStyle: string;
}

export interface Exercise {
  name: string;
  sets: number;
  repetitions: string;
  restSeconds: number;
  instructions: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlanOutput {
  summary: string;
  safetyNotes: string[];
  days: WorkoutDay[];
}
