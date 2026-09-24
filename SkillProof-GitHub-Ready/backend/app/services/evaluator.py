def evaluate(task, code: str):
    # Hackathon-safe deterministic evaluator stub.
    # Replace this service with a real LLM-backed evaluator later.
    length = len(code.strip())
    score = 58 if length < 120 else 72 if length < 300 else 82
    criteria = task.evaluation_criteria or {
        "Correctness": "Strong",
        "Approach": "Good",
        "Problem Solving": "Strong",
        "Understanding": "Needs Improvement",
    }
    return {
        "score": score,
        "criteria": criteria,
        "understanding_check": {
            "questions": [
                {"question": "What is one important decision you made in your solution, and why?"},
                {"question": "What would you check if the result looked suspicious?"},
            ]
        }
    }
