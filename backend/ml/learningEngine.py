from typing import List, Dict, Optional

import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.linear_model import LinearRegression

app = FastAPI(title="learning-engine")


class MetricRow(BaseModel):
    platform: str
    content: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    clicks: int = 0
    retweets: int = 0


class TrainRequest(BaseModel):
    rows: List[MetricRow] = Field(default_factory=list)


class RecommendRequest(BaseModel):
    platform: Optional[str] = None


state = {
    "df": pd.DataFrame(),
    "model": None,
}


def calc_score(df: pd.DataFrame) -> pd.Series:
    return (
        df["likes"]
        + 2 * df["comments"]
        + 3 * df["shares"]
        + 2 * df["saves"]
        + 2 * df["clicks"]
        + 2 * df["retweets"]
    )


@app.get("/health")
def health() -> Dict[str, str]:
    return {"ok": "true"}


@app.post("/train")
def train(payload: TrainRequest):
    if not payload.rows:
        return {"trained": False, "message": "no rows provided"}

    df = pd.DataFrame([r.model_dump() for r in payload.rows])
    df["score"] = calc_score(df)

    X = df[["likes", "comments", "shares", "saves", "clicks", "retweets"]]
    y = df["score"]

    model = LinearRegression()
    model.fit(X, y)

    state["df"] = df
    state["model"] = model

    return {
        "trained": True,
        "rows": len(df),
        "top_score": float(df["score"].max()),
    }


@app.get("/top")
def top(limit: int = 10):
    df = state["df"]
    if df.empty:
        return []

    top_df = df.sort_values("score", ascending=False).head(limit)
    return top_df.to_dict(orient="records")


@app.post("/recommend")
def recommend(payload: RecommendRequest):
    df = state["df"]
    if df.empty:
        return {"prompt": "No data yet. Start collecting platform analytics."}

    subset = df
    if payload.platform:
        subset = df[df["platform"] == payload.platform]
        if subset.empty:
            subset = df

    best = subset.sort_values("score", ascending=False).iloc[0]

    return {
        "prompt": (
            "Generate more posts like this high performer. "
            f"Platform: {best['platform']}. "
            f"Reference content: {best['content']}"
        )
    }
