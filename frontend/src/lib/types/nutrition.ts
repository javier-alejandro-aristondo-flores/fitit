// Mirrors CalorieDataModel.sql (SCRUM-27). The `embedding` column on food_items is
// server-only (used for semantic search) and intentionally omitted here.

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type LoggedVia = 'text_prompt' | 'barcode' | 'photo_ai' | 'manual';
export type UnitType = 'g' | 'ml' | 'oz' | 'serving' | 'unit';

export interface User {
  id: string;
  email: string;
  dailyCalorieTarget: number;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
}

export interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  servingSizeAmount: number;
  servingSizeUnit: UnitType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  micros: Record<string, number>;
}

export interface MealLog {
  id: string;
  userId: string;
  mealType: MealType;
  loggedVia: LoggedVia;
  loggedAt: string;
  userNotes: string | null;
}

export interface LoggedFoodItem {
  id: string;
  mealId: string;
  foodItemId: string | null;
  quantity: number;
  caloriesConsumed: number;
  proteinConsumedG: number;
  carbsConsumedG: number;
  fatConsumedG: number;
  confidenceScore: number;
  isVerified: boolean;
}

export interface DailyNutritionalSummary {
  id: string;
  userId: string;
  logDate: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  calorieTargetAtDate: number;
}
