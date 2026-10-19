from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from app.generate_answer import stream_answer

app = FastAPI(title="AI Engineering Course Companion")


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Question cannot be blank.")

        return value


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def index():
    return {"message": "Hello, World!"}

@app.post("/ask")
def ask(request: AskRequest):
    return StreamingResponse(
        stream_answer(request.question),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )