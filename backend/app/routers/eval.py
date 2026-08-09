import httpx
from fastapi import APIRouter

from app.groq_client import analyze_clause
from app.schemas import EvalItem, EvalResponse

router = APIRouter()


@router.post("/eval/run", response_model=EvalResponse)
async def eval_run(items: list[EvalItem]):
    if not items:
        return EvalResponse(
            category_accuracy=0.0, risk_mae=0.0, high_risk_recall=0.0
        )

    async with httpx.AsyncClient() as client:
        predictions = []
        for item in items:
            predictions.append(await analyze_clause(client, item.clause_text))

    total = len(items)
    correct_category = 0
    abs_errors = 0
    true_high = 0
    true_high_predicted_high = 0

    for item, pred in zip(items, predictions):
        if pred.category == item.true_category:
            correct_category += 1
        abs_errors += abs(pred.risk_score - item.true_risk_score)
        if item.true_risk_score >= 4:
            true_high += 1
            if pred.risk_score >= 4:
                true_high_predicted_high += 1

    category_accuracy = correct_category / total
    risk_mae = abs_errors / total
    high_risk_recall = (
        true_high_predicted_high / true_high if true_high else 0.0
    )

    return EvalResponse(
        category_accuracy=category_accuracy,
        risk_mae=risk_mae,
        high_risk_recall=high_risk_recall,
    )
