# System Specification: NCKH Learning Systems

## 1. Project Overview
**NCKH Learning Systems** is a modern E-learning platform integrated with Machine Learning (ML) to monitor student behavior and predict academic success/risk. The system provides an interactive learning environment for students and a data-driven management console for instructors.

## 2. Technology Stack

### 2.1. Frontend
- **Framework**: React 18+ with Vite (TypeScript)
- **State Management**: Zustand
- **Styling**: Tailwind CSS (Custom components)
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Communication**: Axios (with Interceptors for JWT handling)
- **Routing**: React Router DOM

### 2.2. Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: SQLite3 (managed via TypeORM)
- **Authentication**: Passport.js with JWT Strategy
- **File Handling**: Upload system for course thumbnails and ML models.
- **Integration**: Python bridge for ML inference using `child_process`.

### 2.3. ML Components
- **Inference Engine**: Python 3.10+
- **Input Data**: Multi-dimensional telemetry logs (20+ metrics).
- **Core Script**: `inference.py` for risk evaluation.

---

## 3. Functional Requirements

### 3.1. Student Role
- **Course Exploration**: Search and browse courses by level (Beginner/Intermediate/Advanced) and category.
- **Enrollment & Cart**: Purchase/Enroll in courses with a shopping cart workflow.
- **Learning Interface**: 
  - Watch video lessons.
  - Complete multiple-choice quizzes.
  - Interactive activity tracking (behavioral telemetry).
- **Progress Tracking**: Real-time feedback on completed lessons.
- **Communications**: System inbox for notifications and internal messaging.
- **Profile Management**: Update user metadata and avatar.

### 3.2. Instructor/Admin Role
- **Course Management**: Full CRUD operations for courses, lessons, and quizzes.
- **Learning Analytics**: View aggregated student activity logs.
- **ML Model Registry**: 
  - Upload custom trained models per course.
  - Manage "active" models for inference.
- **Predictive Diagnostics**: 
  - Run ML inference based on real-time student telemetry.
  - View "Failure Risk" and "Confidence" scores for individual students.
  - Auto-generate notifications for high-risk students.

---

## 4. Data Entities & Schema

| Entity | Description |
| :--- | :--- |
| **User** | Storage for credentials, roles (STUDENT/INSTRUCTOR), and profiles. |
| **Course** | Core metadata including category, level, price, and active ML model link. |
| **Lesson** | Content units (VIDEO or QUIZ type) attached to courses. |
| **Enrollment** | Relation mapping students to their enrolled courses. |
| **LearningLog** | Telemetry storage: time spent, video %, click events, scores, and attention metrics. |
| **UploadedModel** | Metadata and file paths for custom Python models. |
| **PredictionResult** | Output of ML inference: failure risk score and confidence level. |
| **Notification** | System alerts and user messages. |
| **LessonCompletion** | Tracking per-student progress within specific lessons. |

---

## 5. ML Workflow (Behavioral Telemetry)

The system captures 22+ specific metrics during student interaction:
1. **Engagement**: Time spent, pages visited, video watch %.
2. **Interactivity**: Click events, notes taken, forum posts.
3. **Performance**: Quiz scores, attempts, assignment scores.
4. **Behavioral Trends**: Days since last activity, cumulative score, learning trend (Improving/Stable/Declining).

**Inference Cycle**:
1. Instructor triggers prediction for a student-course pair.
2. Backend fetches the 20 most recent logs for that student.
3. Nested Python process loads the course-specific model and processes logs.
4. Result is saved to `PredictionResult` and displayed on the Admin Dashboard.

---

## 6. Project structure
```text
/
├── backend/            # NestJS API, TypeORM entities, ML scripts
├── pages/              # React frontend pages (Admin, Dashboard, etc.)
├── store.ts            # Zustand stores for Auth, Cart, Notifs
├── types.ts            # Shared TypeScript interfaces
├── api.ts              # Axios configuration & interceptors
└── App.tsx             # Main router and layout
```
