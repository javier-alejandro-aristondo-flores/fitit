import type { AuthResult, LoginInput, SignupInput } from '../types/auth';
import type { DailyNutritionalSummary } from '../types/nutrition';
import type { WorkoutPlanOutput } from '../types/routine';
import type { ApiClient } from './types';

// Canned data for UI development while SCRUM-15/23 (backend) don't exist yet.
// Numbers match docs/wireframes/dashboard.html so screens built against this mock
// look identical to the wireframes.

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_WORKOUT_PLAN: WorkoutPlanOutput = {
  summary: 'A 4-day push/pull/legs split with dedicated upper and lower accessory days, built around dumbbell equipment.',
  safetyNotes: ['No known injuries reported. Stop any exercise that causes pain and consult a professional if it persists.'],
  days: [
    { day: 'Monday', focus: 'Pull', exercises: [
      { name: 'Bent-over row', sets: 4, repetitions: '8-10', restSeconds: 90, instructions: 'Keep back flat, pull to lower ribs.' },
      { name: 'Lat pulldown', sets: 3, repetitions: '10-12', restSeconds: 75, instructions: 'Control the eccentric.' },
      { name: 'Face pulls', sets: 3, repetitions: '15', restSeconds: 60, instructions: 'Pull to eye level, squeeze rear delts.' },
    ] },
    { day: 'Tuesday', focus: 'Push', exercises: [
      { name: 'Bench press', sets: 4, repetitions: '8', restSeconds: 120, instructions: 'Full range of motion, controlled descent.' },
      { name: 'Overhead press', sets: 3, repetitions: '10', restSeconds: 90, instructions: 'Brace core, avoid arching the lower back.' },
      { name: 'Incline DB press', sets: 3, repetitions: '10', restSeconds: 90, instructions: '30-45 degree incline.' },
      { name: 'Lateral raises', sets: 3, repetitions: '15', restSeconds: 60, instructions: 'Slight bend in elbow, raise to shoulder height.' },
      { name: 'Triceps dips', sets: 3, repetitions: '12', restSeconds: 60, instructions: 'Lean forward slightly, lower under control.' },
    ] },
    { day: 'Wednesday', focus: 'Legs', exercises: [
      { name: 'Squat', sets: 4, repetitions: '8', restSeconds: 120, instructions: 'Keep chest up, hips below knees at the bottom.' },
      { name: 'Romanian deadlift', sets: 3, repetitions: '10', restSeconds: 90, instructions: 'Hinge at hips, keep bar close to legs.' },
      { name: 'Walking lunges', sets: 3, repetitions: '12 per leg', restSeconds: 60, instructions: 'Step far enough for a 90-degree front knee.' },
    ] },
    { day: 'Thursday', focus: 'Rest', exercises: [] },
    { day: 'Friday', focus: 'Upper', exercises: [
      { name: 'Pull-ups', sets: 4, repetitions: 'to failure', restSeconds: 90, instructions: 'Use assistance band if needed.' },
      { name: 'DB shoulder press', sets: 3, repetitions: '10', restSeconds: 90, instructions: 'Neutral grip, avoid locking out elbows.' },
      { name: 'Cable row', sets: 3, repetitions: '12', restSeconds: 75, instructions: 'Squeeze shoulder blades together at the end.' },
    ] },
    { day: 'Saturday', focus: 'Lower', exercises: [
      { name: 'Leg press', sets: 4, repetitions: '10', restSeconds: 90, instructions: 'Feet shoulder-width, do not lock knees.' },
      { name: 'Leg curl', sets: 3, repetitions: '12', restSeconds: 60, instructions: 'Control the negative.' },
      { name: 'Calf raises', sets: 4, repetitions: '15', restSeconds: 45, instructions: 'Pause at the top of each rep.' },
    ] },
    { day: 'Sunday', focus: 'Rest', exercises: [] },
  ],
};

const MOCK_DAILY_SUMMARY: DailyNutritionalSummary = {
  id: 'mock-summary-1',
  userId: 'mock-user-1',
  logDate: new Date().toISOString().slice(0, 10),
  totalCalories: 1450,
  totalProteinG: 112,
  totalCarbsG: 140,
  totalFatG: 42,
  calorieTargetAtDate: 2300,
};

export const mockApi: ApiClient = {
  auth: {
    async signup(_input: SignupInput): Promise<AuthResult> {
      await delay();
      return { token: 'mock-token', userId: 'mock-user-1', onboardingComplete: false };
    },
    async login(_input: LoginInput): Promise<AuthResult> {
      await delay();
      return { token: 'mock-token', userId: 'mock-user-1', onboardingComplete: true };
    },
  },
  routines: {
    async generate() {
      await delay(1200);
      return MOCK_WORKOUT_PLAN;
    },
    async getCurrent() {
      await delay();
      return MOCK_WORKOUT_PLAN;
    },
  },
  logs: {
    async getDailySummary(_date: string) {
      await delay();
      return MOCK_DAILY_SUMMARY;
    },
    async logFoodFromText(_text: string) {
      await delay();
    },
  },
  workouts: {
    async logSet(_exerciseName: string, _reps: number, _weight: number) {
      await delay(150);
    },
    async finishWorkout() {
      await delay();
    },
    async skipToday() {
      await delay();
    },
  },
};
