
import time
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AnalysisRequest(BaseModel):
    file_path: str

@app.post("/analyze")
def analyze(request: AnalysisRequest):
    """
    Accepts a file path, simulates a delay, and returns a mock analysis.
    """
    print(f"Received request to analyze: {request.file_path}")
    
    # Simulate ML model processing time
    time.sleep(2)
    
    # Return a hardcoded mock result
    mock_result = {
        "crop": "tomato",
        "disease": "Late Blight",
        "confidence": 0.88,
        "suggestions": [
            "Apply a fungicide containing mancozeb or chlorothalonil.",
            "Ensure proper spacing between plants for better air circulation.",
            "Remove and destroy infected plant debris."
        ]
    }
    
    print(f"Returning analysis: {mock_result}")
    return mock_result

@app.get("/")
def health_check():
    return {"status": "ML service is running"}

