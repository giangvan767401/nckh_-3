"""
Student Failure Prediction - XGBoost Inference Script
======================================================
Features (theo thứ tự model được train):
  1. timeSpentMinutes       - Thời gian học (phút)
  2. pagesVisited           - Số trang đã xem
  3. videoWatchedPercent    - % video đã xem
  4. clickEvents            - Tổng số click
  5. notesTaken             - Số ghi chú đã tạo
  6. forumPosts             - Số bài forum
  7. quizScore              - Điểm quiz (%)
  8. attemptsTaken          - Số lần thử quiz
  9. assignmentScore        - Điểm assignment
 10. feedbackRating         - Rating phản hồi (1-5)
 11. daysSinceLastActivity  - Số ngày kể từ hoạt động cuối
 12. cumulativeQuizScore    - Tổng điểm quiz tích lũy
 13. attentionScore         - Điểm chú ý (0-1)

Output JSON:
  {
    "failureRisk": float [0-1],   -- xác suất RỚT
    "confidence": float [0-1],    -- độ tin cậy
    "verdict": "PASS" | "FAIL",   -- kết quả phán quyết
    "details": { ... }            -- chi tiết features
  }
"""

import sys
import json
import argparse
import os

try:
    import numpy as np
except ImportError:
    np = None

try:
    import pandas as pd
except ImportError:
    pd = None

# ── Helpers ─────────────────────────────────────────────────────────────────

def safe_avg(lst):
    return sum(lst) / len(lst) if lst else 0.0

def safe_sum(lst):
    return sum(lst)

# ── Feature Extraction ───────────────────────────────────────────────────────

def extract_features(logs: list) -> tuple:
    """
    Trích xuất 13 features từ danh sách learning logs.
    Trả về (feature_array, feature_dict) để log chi tiết.
    """
    time_spent       = [l.get('timeSpentMinutes', 0) or 0 for l in logs]
    pages_visited    = [l.get('pagesVisited', 0) or 0 for l in logs]
    video_pct        = [l.get('videoWatchedPercent', 0) or 0 for l in logs]
    clicks           = [l.get('clickEvents', 0) or 0 for l in logs]
    notes            = [l.get('notesTaken', 0) or 0 for l in logs]
    forum            = [l.get('forumPosts', 0) or 0 for l in logs]
    quiz_scores      = [l.get('quizScore', 0) or 0 for l in logs]
    attempts         = [l.get('attemptsTaken', 1) or 1 for l in logs]
    assign_scores    = [l.get('assignmentScore', 0) or 0 for l in logs]
    feedback         = [l.get('feedbackRating', 3) or 3 for l in logs]
    days_inactive    = [l.get('daysSinceLastActivity', 0) or 0 for l in logs]
    cumul_quiz       = [l.get('cumulativeQuizScore', 0) or 0 for l in logs]
    attention        = [l.get('attentionScore', 0.5) or 0.5 for l in logs]

    avg_time      = safe_avg(time_spent)
    avg_pages     = safe_avg(pages_visited)
    avg_video     = safe_avg(video_pct)
    total_clicks  = safe_sum(clicks)
    avg_notes     = safe_avg(notes)
    avg_forum     = safe_avg(forum)
    avg_quiz      = safe_avg(quiz_scores)
    avg_attempts  = safe_avg(attempts)
    avg_assign    = safe_avg(assign_scores)
    avg_feedback  = safe_avg(feedback)
    avg_inactive  = safe_avg(days_inactive)
    avg_cumul     = safe_avg(cumul_quiz)
    avg_attention = safe_avg(attention)

    feature_dict = {
        "avgTimeSpent":          round(avg_time, 2),
        "avgPagesVisited":       round(avg_pages, 2),
        "avgVideoWatched":       round(avg_video, 2),
        "totalInteractionEvents": int(total_clicks),
        "avgNotesTaken":         round(avg_notes, 2),
        "avgForumPosts":         round(avg_forum, 2),
        "avgQuizScore":          round(avg_quiz, 2),
        "avgAttempts":           round(avg_attempts, 2),
        "avgAssignmentScore":    round(avg_assign, 2),
        "avgFeedbackRating":     round(avg_feedback, 2),
        "avgDaysInactive":       round(avg_inactive, 2),
        "avgCumulativeQuiz":     round(avg_cumul, 2),
        "avgAttentionScore":     round(avg_attention, 4),
        "totalLogsAnalyzed":     len(logs)
    }

    feature_array = None
    if np is not None:
        feature_array = np.array([[
            avg_time, avg_pages, avg_video, total_clicks,
            avg_notes, avg_forum, avg_quiz, avg_attempts,
            avg_assign, avg_feedback, avg_inactive,
            avg_cumul, avg_attention
        ]], dtype=np.float32)

    return feature_array, feature_dict

# ── XGBoost Inference ─────────────────────────────────────────────────────────

def run_xgb_inference(model_path: str, scaler_path: str, threshold_path: str, logs: list) -> dict:
    """
    Chạy inference với XGBoost model + StandardScaler + custom threshold.
    Fallback về heuristic nếu import lỗi.
    """
    if not logs:
        return {"error": "No telemetry logs provided for student"}

    features, feature_dict = extract_features(logs)

    try:
        import pickle
        import time
        start_time = time.time()

        # ── Load các artifacts ──
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")

        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Load scaler an toàn
        scaler = None
        if scaler_path and os.path.exists(scaler_path):
            try:
                with open(scaler_path, 'rb') as f:
                    scaler = pickle.load(f)
            except Exception as e:
                feature_dict["warning_scaler"] = f"Lỗi load scaler (có thể do phiên bản scikit-learn): {str(e)}"

        # Load threshold an toàn (default 0.5)
        threshold = 0.5
        if threshold_path and os.path.exists(threshold_path):
            try:
                with open(threshold_path, 'rb') as f:
                    t_val = pickle.load(f)
                    if hasattr(t_val, '__float__'):
                        threshold = float(t_val)
                    elif isinstance(t_val, (list, np.ndarray)):
                        threshold = float(t_val[0])
            except Exception as e:
                feature_dict["warning_threshold"] = f"Lỗi load threshold: {str(e)}"

        # ── Transform features ──
        if np is None:
            raise ImportError("Numpy is required for ML inference. Falling back to heuristic.")
            
        X = features
        if scaler is not None:
            try:
                X = scaler.transform(features)
            except Exception:
                X = features

        # ── Predict ──
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(X)[0]
            prob_fail = float(proba[1] if len(proba) == 2 else proba[0])
        elif hasattr(model, 'predict'):
            pred = model.predict(X)[0]
            prob_fail = float(pred)
        else:
            raise ValueError("Model không có predict_proba hoặc predict")

        failure_risk = prob_fail
        verdict = "FAIL" if failure_risk >= threshold else "PASS"

        # Confidence: khoảng cách từ threshold (càng xa, càng chắc)
        confidence = min(1.0, abs(failure_risk - threshold) / 0.5 + 0.5)

        latency_ms = int((time.time() - start_time) * 1000)

        return {
            "failureRisk": round(failure_risk, 4),
            "confidence":  round(confidence, 4),
            "verdict":     verdict,
            "details": {
                **feature_dict,
                "threshold":        round(float(threshold), 4),
                "inferenceSource":  "xgboost_pkl",
                "modelPath":        os.path.basename(model_path),
                "latencyMs":        latency_ms
            }
        }

    except Exception as e:
        # ── Heuristic Fallback ────────────────────────────────────────────────
        # Khi không load được model, dùng công thức heuristic đơn giản
        _, feature_dict = extract_features(logs)

        avg_quiz   = feature_dict.get("avgQuizScore", 50)
        avg_time   = feature_dict.get("avgTimeSpent", 10)
        avg_assign = feature_dict.get("avgAssignmentScore", 50)
        avg_attn   = feature_dict.get("avgAttentionScore", 0.5)
        avg_inact  = feature_dict.get("avgDaysInactive", 0)

        # Risk tăng khi điểm thấp, ít học, hay vắng
        score_risk   = (100 - avg_quiz) / 100.0
        assign_risk  = (100 - avg_assign) / 100.0
        time_risk    = 1.0 if avg_time < 5 else (0.3 if avg_time > 30 else 0.6)
        attn_risk    = 1.0 - avg_attn
        inact_risk   = min(1.0, avg_inact / 14.0)  # >14 ngày không học = max risk

        failure_risk = (
            score_risk  * 0.35 +
            assign_risk * 0.25 +
            time_risk   * 0.15 +
            attn_risk   * 0.15 +
            inact_risk  * 0.10
        )
        failure_risk = max(0.0, min(1.0, failure_risk))
        threshold = 0.5
        verdict = "FAIL" if failure_risk >= threshold else "PASS"

        return {
            "failureRisk": round(failure_risk, 4),
            "confidence":  0.65,
            "verdict":     verdict,
            "details": {
                **feature_dict,
                "threshold":       threshold,
                "inferenceSource": f"heuristic_fallback (model_err: {str(e)})",
                "modelPath":       os.path.basename(model_path) if model_path else "none"
            }
        }


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="XGBoost Student Failure Predictor")
    parser.add_argument("--model_path",     required=True,  help="Path to model .pkl file")
    parser.add_argument("--scaler_path",    required=False, default="", help="Path to scaler .pkl")
    parser.add_argument("--threshold_path", required=False, default="", help="Path to threshold .pkl")
    parser.add_argument("--logs",           required=True,  help="JSON string of learning logs array")
    args = parser.parse_args()

    try:
        logs_data = json.loads(args.logs)
        result = run_xgb_inference(
            model_path=args.model_path,
            scaler_path=args.scaler_path,
            threshold_path=args.threshold_path,
            logs=logs_data
        )
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": f"Script execution error: {str(e)}"}))
        sys.exit(1)
