import sys
import json
import argparse
import numpy as np
import os

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

class SimpleStudentMLP(nn.Module):
    def __init__(self, input_size=4):
        super(SimpleStudentMLP, self).__init__()
        if not TORCH_AVAILABLE: return
        self.layers = nn.Sequential(
            nn.Linear(input_size, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )
    def forward(self, x):
        return self.layers(x)

def run_inference(model_path, logs):
    try:
        if not logs:
            return {"error": "No log data for this student"}

        time_spent = [l.get('timeSpentMinutes', 0) for l in logs]
        scores = [l.get('quizScore', 0) for l in logs]
        clicks = [l.get('clickEvents', 0) for l in logs]
        video_pct = [l.get('videoWatchedPercent', 0) for l in logs]
        
        avg_time = sum(time_spent) / len(time_spent) if time_spent else 0
        avg_score = sum(scores) / len(scores) if scores else 0
        total_clicks = sum(clicks)
        avg_video = sum(video_pct) / len(video_pct) if video_pct else 0
        
        risk = 0.5
        confidence = 0.7
        source = "heuristic"

        if TORCH_AVAILABLE and os.path.exists(model_path):
            try:
                checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
                input_tensor = torch.tensor([[avg_time, avg_score, total_clicks, avg_video]], dtype=torch.float32)
                
                if isinstance(checkpoint, dict):
                    model = SimpleStudentMLP(input_size=4)
                    model.load_state_dict(checkpoint, strict=False)
                    model.eval()
                else:
                    model = checkpoint
                    model.eval()

                with torch.no_grad():
                    prediction = model(input_tensor)
                    prob_success = float(prediction.item())
                    risk = 1.0 - prob_success
                    confidence = 0.95
                    source = "pytorch_model"
            except Exception as e:
                source = f"heuristic_fallback (model_err: {str(e)})"

        if source.startswith("heuristic"):
            score_factor = (100 - avg_score) / 100
            time_factor = 1.0 if avg_time < 5 else (0.5 if avg_time > 30 else 0.7)
            risk = (score_factor * 0.7) + (time_factor * 0.3)
            risk = max(0.0, min(1.0, risk))

        return {
            "failureRisk": risk,
            "confidence": confidence,
            "details": {
                "avgScore": avg_score,
                "avgTimeSpent": avg_time,
                "totalClicks": total_clicks,
                "avgVideo": avg_video,
                "inferenceSource": source
            }
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", required=True)
    parser.add_argument("--logs", required=True)
    args = parser.parse_args()

    try:
        logs_json = json.loads(args.logs)
        output = run_inference(args.model_path, logs_json)
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": f"Script execution error: {str(e)}"}))
