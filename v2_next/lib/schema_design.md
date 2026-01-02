
# Database Schema Design

## Entities

### 1. School (학교)
- `id`: UUID (Primary Key)
- `name`: String (e.g., "서울고등학교")
- `paymentStatus`: Enum (PAID, EXPIRED)
- `createdAt`: DateTime

### 2. Class (학급)
- `id`: UUID (Primary Key)
- `schoolId`: UUID (Foreign Key to School)
- `name`: String (e.g., "1학년 3반")
- `accessCode`: String (Optional, for easy entry)

### 3. Student (학생)
- `id`: UUID (Primary Key)
- `classId`: UUID (Foreign Key to Class)
- `name`: String (Student's real name)
- `recentLogins`: DateTime[] (Last 3 logins)

### 4. Progress (학습 진도)
- `id`: UUID (Primary Key)
- `studentId`: UUID (Foreign Key to Student)
- `chapterId`: String (e.g., "ch01")
- `completed`: Boolean
- `score`: Int
- `wrongAnswers`: JSON (For Weakness Analysis)
- `lastAttempt`: DateTime

## Relationships
- School (1) <-> (*) Class
- Class (1) <-> (*) Student
- Student (1) <-> (*) Progress
