import type { WorkoutPlanInput } from '../../lib/types/routine';

// Simple module-scoped accumulator for the 3-step onboarding flow (goal → about →
// equipment). Each step's screen owns its own local selection state and commits to
// this object on "Next"; the final step reads it to build the WorkoutPlanInput.
// A real store (context/zustand) can replace this if onboarding grows more steps.
interface OnboardingDraft {
  goal: string;
  experienceLevel: string;
  age: string;
  height: string;
  weight: string;
  daysPerWeek: number;
  equipment: string[];
}

const draft: OnboardingDraft = {
  goal: '',
  experienceLevel: '',
  age: '',
  height: '',
  weight: '',
  daysPerWeek: 4,
  equipment: [],
};

export function getOnboardingDraft(): OnboardingDraft {
  return draft;
}

export function updateOnboardingDraft(patch: Partial<OnboardingDraft>) {
  Object.assign(draft, patch);
}

export function draftToWorkoutPlanInput(): WorkoutPlanInput {
  return {
    goal: draft.goal || 'General fitness',
    experienceLevel: draft.experienceLevel || 'Beginner',
    daysPerWeek: draft.daysPerWeek,
    sessionLengthMinutes: 45,
    equipment: draft.equipment.length > 0 ? draft.equipment : ['Bodyweight only'],
    limitations: 'No known injuries',
    preferredTrainingStyle: 'Strength training',
  };
}
