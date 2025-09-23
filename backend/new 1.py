from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

class FormData(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, descriptiom="The user's login name")
    email: str = Field(..., example="user@example.com")
    dept_code: int = Field(...)

@app.post("/api/submit")
async def handle_submission(data: FormData):
    print("Form data:", data.dict())
    
    return {"status": "success", "message": "Form data received successfully"}