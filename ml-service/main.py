from typing import List, Dict

import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="ml-service")


class LearnRow(BaseModel):
    platform: str
    content: str
    likes: int = 0
    comments: int = 0
    shares: int = 0


class LearnRequest(BaseModel):
    data: List[LearnRow] = Field(default_factory=list)


state_df = pd.DataFrame()


def score(df: pd.DataFrame):
    return df["likes"] + 2 * df["comments"] + 3 * df["shares"]


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/learn")
def learn(payload: LearnRequest):
    global state_df
    if not payload.data:
        return {"ok": False, "message": "No rows"}

    state_df = pd.DataFrame([r.model_dump() for r in payload.data])
    state_df["score"] = score(state_df)
    return {"ok": True, "rows": len(state_df)}


@app.get("/top")
def top(limit: int = 10) -> List[Dict]:
    if state_df.empty:
        return []
    return state_df.sort_values("score", ascending=False).head(limit).to_dict(orient="records")
