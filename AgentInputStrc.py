from openai import OpenAI
import json

client = OpenAI()



def generate_workout_plan(user_input: dict) -> dict:
    instructions = """
You are a careful fitness-planning assistant.

Create a realistic 7-day workout plan using the user's goals, experience,
equipment, schedule, and limitations.

Rules:
- Include rest or recovery days.
- Do not diagnose injuries or medical conditions.
- If the user reports pain, injury, or a medical condition, recommend
  consulting a qualified professional.
- Make exercises, sets, repetitions, and rest periods specific.
- Keep the plan appropriate for the user's experience level.
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        instructions=instructions,
        input=json.dumps(user_input),
        text={
            "format": {
                "type": "json_schema",
                "name": "workout_plan",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string"},
                        "safety_notes": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "days": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "day": {"type": "string"},
                                    "focus": {"type": "string"},
                                    "exercises": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {"type": "string"},
                                                "sets": {"type": "integer"},
                                                "repetitions": {"type": "string"},
                                                "rest_seconds": {"type": "integer"},
                                                "instructions": {"type": "string"}
                                            },
                                            "required": [
                                                "name",
                                                "sets",
                                                "repetitions",
                                                "rest_seconds",
                                                "instructions"
                                            ],
                                            "additionalProperties": False
                                        }
                                    }
                                },
                                "required": ["day", "focus", "exercises"],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": ["summary", "safety_notes", "days"],
                    "additionalProperties": False
                }
            }
        }
    )

    return json.loads(response.output_text)


if __name__ == "__main__":
    user_input = {
        "goal": "Build muscle",
        "experience_level": "Beginner",
        "days_per_week": 4,
        "session_length_minutes": 45,
        "equipment": ["Dumbbells", "Bench"],
        "limitations": "No known injuries",
        "preferred_training_style": "Strength training"
    }

    plan = generate_workout_plan(user_input)
    print(json.dumps(plan, indent=2))
        