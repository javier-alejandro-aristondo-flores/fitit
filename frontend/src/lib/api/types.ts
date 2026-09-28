import type { AuthResult, LoginInput, SignupInput } from '../types/auth';
import type { DailyNutritionalSummary } from '../types/nutrition';
import type { WorkoutPlanInput, WorkoutPlanOutput } from '../types/routine';

export interface ApiClient {
  auth: {
    signup(input: SignupInput): Promise<AuthResult>;
    login(input: LoginInput): Promise<AuthResult>;
  };
  routines: {
    generate(input: WorkoutPlanInput): Promise<WorkoutPlanOutput>;
    getCurrent(): Promise<WorkoutPlanOutput | null>;
  };
  logs: {
    getDailySummary(date: string): Promise<DailyNutritionalSummary | null>;
    logFoodFromText(text: string): Promise<void>;
  };
  workouts: {
    logSet(exerciseName: string, reps: number, weight: number): Promise<void>;
    finishWorkout(): Promise<void>;
    skipToday(): Promise<void>;
  };
}
