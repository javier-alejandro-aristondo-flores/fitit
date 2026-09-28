// Provisional — SCRUM-15 (Express backend) has not defined a contract yet. Inferred
// from the form fields in docs/wireframes/signup-flow.html. Confirm with SCRUM-15's
// owner once that branch has real code.

export interface SignupInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  userId: string;
  onboardingComplete: boolean;
}
