# 현재 구현된 핵심 기능 목록

> **작성일**: 2025-12-16  
> **목적**: 대대적인 업그레이드 전 현재 시스템의 핵심 기능 파악 및 백업 준비

---

## 📋 시스템 개요

**프로젝트명**: 3D 프린터 운용 기능사 학습 시스템  
**현재 버전**: v12  
**주요 기술 스택**: HTML, CSS, JavaScript, Google Apps Script  
**배포 플랫폼**: Netlify

---

## 🎯 핵심 기능 분류

### 1. 👤 사용자 관리 및 인증

#### 1.1 로그인 시스템
- **파일**: `js/script.js` (login 함수)
- **기능**:
  - 학번+이름 형식 입력 (`2701홍길동`)
  - 띄어쓰기 금지 검증
  - Google Sheets 연동 사용자 데이터 조회/생성
  - LocalStorage 기반 세션 유지
- **관련 코드**: 
  ```javascript
  function login()
  function syncUserData()
  ```

#### 1.2 사용자 데이터 구조
- **저장소**: Google Sheets + LocalStorage
- **데이터 필드**:
  - `name`: 사용자 이름
  - `temperature`: 학습 온도 (게이미피케이션 지표)
  - `progress`: 챕터별 진도 (JSON)
  - `typingAttempts`: 이론 타이핑 시도 횟수
  - `wrongAnswers`: 오답 기록
  - `lastUpdated`: 최종 업데이트 시간

#### 1.3 온도(Temperature) 시스템
- **파일**: `js/script.js` (updateTemperature, getRankInfo)
- **기능**:
  - 학습 활동에 따라 온도 증감
  - 온도별 등급 시스템 (초보자 → 전문가)
  - 실시간 온도 표시
- **온도 변화 규칙**:
  - 퀴즈 통과: +0.5°C
  - 오답 복습 완료: +0.3°C
  - 타이핑 성공: +0.2°C

---

### 2. 📚 학습 시스템 (3단계 구조)

#### 2.1 1단계: 기초 학습 (이론 + 기초 문제)
- **데이터 파일**: `data.js` (appData)
- **챕터 구성**: Part 1 ~ Part 9
- **학습 흐름**:
  1. 이론 학습 (Theory Mode)
  2. 이론 타이핑 (Typing Practice)
  3. 퀴즈 풀이 (Quiz Mode)
  4. 오답 복습 (Review Mode)

**잠금 로직**:
- Part 1은 항상 열림
- Part 2 이상은 이전 Part 통과 필요 (2개 이하 오답)

#### 2.2 2단계: 주제별 기출문제
- **데이터 파일**: `data_practice.js` (practiceData)
- **특징**:
  - 실제 기출문제 주제별 분류
  - 1단계 전체 완료 후 잠금 해제
  - 순차적 진행 (이전 챕터 통과 필수)

#### 2.3 3단계: 연도별 기출문제
- **데이터 파일**: `data_advanced.js` (advancedData)
- **특징**:
  - 연도별 기출문제 (2018~2023)
  - 2단계 전체 완료 후 잠금 해제
  - 실전 모의고사 형식

---

### 3. 📝 이론 학습 모드 (Theory Mode)

#### 3.1 핵심 이론 표시
- **화면**: `theory-screen`
- **기능**:
  - 챕터별 핵심 이론 텍스트 표시
  - 스플릿 뷰 (이론 | 타이핑 영역)
  - 복사 방지 기능

#### 3.2 타이핑 연습 (Typing Practice)
- **파일**: `js/script.js` (checkTyping, updateAccuracy)
- **핵심 기능**:
  - **정확도 계산**: Levenshtein Distance 알고리즘
  - **실시간 작성량 표시**: 0% ~ 100%
  - **자동 문자 변환**:
    - `--` → `→`
    - `..` → `·`
  - **복사/붙여넣기 차단**
  - **2회 시도 제한**: 94% 정확도 2회 달성 시 퀴즈 잠금 해제

**정확도 기준**:
- 목표: 94% 이상
- 작성량: 98% 이상
- 공백 무시 비교

#### 3.3 AI 튜터 (Q&A 기능)
- **화면**: `qna-panel`
- **기능**:
  - 이론 학습 중 질문 가능
  - Gemini API 연동 (예정)
  - 채팅 형식 UI
  - 이론 화면에서만 표시

---

### 4. ✅ 퀴즈 모드 (Quiz Mode)

#### 4.1 문제 출제 시스템
- **파일**: `js/script.js` (startQuiz, renderQuizItems)
- **기능**:
  - 챕터별 문제 로드
  - 선택지 랜덤 셔플 (shuffleArray)
  - 이미지 문제 지원
  - Canvas 기반 문제 텍스트 렌더링 (복사 방지)

#### 4.2 문제 데이터 구조
```javascript
{
  id: "문제 ID",
  question: "문제 텍스트",
  context: "보기/상황 설명 (선택)",
  choices: ["선택지1", "선택지2", "선택지3", "선택지4"],
  answer: "정답 (①, ②, ③, ④)",
  explanation: "해설",
  image: "이미지 경로 (선택)"
}
```

#### 4.3 답안 제출 및 채점
- **파일**: `js/script.js` (submitQuiz)
- **기능**:
  - 전체 답안 일괄 제출
  - 즉시 채점 및 결과 표시
  - 합격 기준: 오답 2개 이하
  - 불합격 시 오답 노트 강제 진입

#### 4.4 힌트 시스템
- **파일**: `js/script.js` (showHintModal, updateHintButton)
- **기능**:
  - 문제 수의 20% 힌트 제공
  - 힌트 = 해당 챕터 핵심 이론
  - 사용 횟수 제한 및 표시
  - 힌트 내용 복사 방지

---

### 5. 📖 오답 노트 (Review Mode)

#### 5.1 강제 복습 시스템
- **파일**: `js/script.js` (startReviewMode)
- **기능**:
  - 퀴즈 불합격 시 자동 진입
  - 페이지 이탈 방지 (`beforeunload` 경고)
  - 오답 문제 해설 타이핑 연습
  - 모든 오답 복습 완료 시 대시보드 복귀

#### 5.2 복습 상태 저장
- **파일**: `js/script.js` (saveReviewState, restoreReviewState)
- **기능**:
  - LocalStorage에 복습 상태 저장
  - 페이지 새로고침 시 복습 화면 복원
  - 관리자 강제 탈출 (Ctrl+Shift+C+Click)

---

### 6. 💾 데이터 관리 및 동기화

#### 6.1 Google Sheets 연동
- **파일**: `google_apps_script.js`
- **API URL**: `https://script.google.com/macros/s/.../exec`
- **기능**:
  - 사용자 데이터 조회 (GET)
  - 사용자 데이터 업데이트 (POST)
  - 리더보드 데이터 조회
  - 비동기 동기화 (async/await)

#### 6.2 로컬 저장소 (LocalStorage)
- **키**: `appData`
- **용도**:
  - 오프라인 학습 지원
  - 빠른 데이터 로드
  - 세션 유지

#### 6.3 데이터 동기화 전략
- **시점**:
  - 로그인 시
  - 퀴즈 제출 시
  - 타이핑 성공 시
  - 오답 복습 완료 시
- **충돌 해결**: 서버 데이터 우선

---

### 7. 🔒 보안 및 부정행위 방지

#### 7.1 다중 탭 방지
- **파일**: `js/multi_tab_prevention.js`
- **기능**:
  - LocalStorage 기반 탭 감지
  - 중복 탭 열림 시 경고 및 차단
  - 탭 닫힘 감지 및 정리

#### 7.2 개발자 도구 차단
- **파일**: `js/multi_tab_prevention.js`
- **기능**:
  - F12 키 차단
  - 우클릭 메뉴 차단
  - DevTools 열림 감지 (크기 변화 감지)
  - 경고 화면 표시 및 body 제거

#### 7.3 복사 방지
- **적용 대상**:
  - 이론 텍스트
  - 문제 텍스트 (Canvas 렌더링)
  - 힌트 모달
  - 타이핑 영역
- **방법**:
  - `copy`, `cut`, `paste` 이벤트 차단
  - `contextmenu` 차단
  - Canvas 기반 텍스트 렌더링

---

### 8. 📊 분석 및 통계

#### 8.1 취약점 분석 (Analysis Screen)
- **파일**: `js/script.js` (showAnalysis)
- **기능**:
  - 평균 60점 미만 취약 단원 표시
  - 자주 틀리는 문제 Top 10
  - 취약 문제 집중 공략 모드

#### 8.2 리더보드 (Leaderboard)
- **파일**: `js/script.js` (showLeaderboard)
- **기능**:
  - 전체 사용자 온도 순위 Top 50
  - Google Sheets 실시간 조회
  - 순위, 이름, 온도, 점수, 날짜 표시

---

### 9. 🎨 UI/UX 기능

#### 9.1 다크 모드
- **파일**: `js/script.js` (toggleDarkMode)
- **기능**:
  - 라이트/다크 테마 전환
  - LocalStorage에 설정 저장
  - CSS 변수 기반 색상 변경

#### 9.2 사이드 네비게이션
- **화면**: `side-nav`
- **버튼**:
  - 🌙 다크모드
  - 📊 분석
  - 🏆 랭킹
  - 💡 힌트 (퀴즈 화면에서만)
  - ❓ 질문 (이론 화면에서만)

#### 9.3 모달 시스템
- **종류**:
  - 일반 알림 모달 (`message-modal`)
  - 힌트 모달 (`hint-modal`)
- **기능**:
  - 중앙 정렬 팝업
  - 배경 어둡게 처리
  - 콜백 함수 지원

#### 9.4 진행 상태 표시
- **대시보드**:
  - 챕터 카드에 "합격" 배지
  - 잠금 오버레이 (🔒)
- **퀴즈 화면**:
  - 진행률 표시 (예: 3/10)
  - 실시간 정확도 표시

#### 9.5 애니메이션 효과
- **파일**: `js/script.js` (showFireworks)
- **적용**:
  - 퀴즈 합격 시 폭죽 효과
  - 카드 호버 효과
  - 버튼 클릭 효과

---

### 10. 🎮 게이미피케이션

#### 10.1 온도 시스템
- **범위**: 36.0°C ~ 42.0°C
- **등급**:
  - 36.0 ~ 36.5: 초보자
  - 36.5 ~ 37.0: 학습자
  - 37.0 ~ 37.5: 숙련자
  - 37.5 ~ 38.0: 전문가
  - 38.0+: 마스터

#### 10.2 명언 시스템
- **파일**: `js/script.js` (displayRandomQuote)
- **기능**:
  - 로그인 화면에 랜덤 명언 표시
  - 학습 동기 부여

---

### 11. 🛠️ 관리자 기능

#### 11.1 관리자 페이지
- **파일**: `teacher.html`, `js/teacher_data.js`
- **기능**:
  - 전체 학생 데이터 조회
  - 학습 진도 모니터링
  - 통계 대시보드

#### 11.2 개발자 치트
- **코드**: `window.isDevUnlocked`
- **기능**:
  - 모든 챕터 잠금 해제
  - 디버깅 용도

#### 11.3 강제 탈출
- **단축키**: Ctrl+Shift+C+Click (이름/온도 클릭)
- **기능**:
  - 오답 노트 강제 종료
  - 페이지 새로고침

---

## 📁 핵심 파일 구조

### HTML 파일
```
index.html          - 메인 학습 페이지
teacher.html        - 관리자 페이지
```

### JavaScript 파일
```
js/
├── script.js                    - 메인 로직 (83KB, 2226줄)
├── multi_tab_prevention.js      - 보안 기능
└── teacher_data.js              - 관리자 데이터

data.js              - 1단계 데이터 (93KB)
data_practice.js     - 2단계 데이터 (523KB)
data_advanced.js     - 3단계 데이터 (486KB)
```

### CSS 파일
```
css/
├── style.css                    - 메인 스타일 (24KB)
├── multi_tab_prevention.css     - 보안 UI
└── teacher.css                  - 관리자 스타일
```

### 기타
```
google_apps_script.js   - Google Sheets 연동 스크립트
netlify.toml            - Netlify 배포 설정
```

---

## 🔑 주요 함수 목록

### 사용자 관리
- `login()` - 로그인 처리
- `syncUserData()` - Google Sheets 동기화
- `updateTemperature(amount)` - 온도 업데이트
- `updateTemperatureDisplay()` - 온도 표시 갱신

### 학습 흐름
- `initDashboard()` - 대시보드 초기화
- `startQuiz(chapterId)` - 퀴즈 시작
- `checkTyping()` - 타이핑 정확도 검사
- `submitQuiz()` - 퀴즈 제출
- `retryQuiz()` - 퀴즈 재시도

### 오답 복습
- `startReviewMode()` - 오답 노트 시작
- `finishReview()` - 복습 완료
- `saveReviewState()` - 복습 상태 저장
- `restoreReviewState()` - 복습 상태 복원

### UI/UX
- `showScreen(screenId)` - 화면 전환
- `showModal(title, message, callback)` - 모달 표시
- `toggleDarkMode()` - 다크 모드 전환
- `showFireworks()` - 폭죽 효과

### 분석
- `showAnalysis()` - 취약점 분석
- `showLeaderboard()` - 리더보드 표시
- `startWeaknessReview()` - 취약 문제 집중 공략

### 보안
- `checkAdminEscape(e)` - 관리자 강제 탈출
- `preventCopy(e)` - 복사 방지
- `renderQuestionCanvas(container, text)` - Canvas 렌더링

---

## 📊 데이터 구조

### appData (LocalStorage)
```javascript
{
  userData: {
    name: "2701홍길동",
    temperature: 36.5,
    progress: {
      "part1": {
        passed: true,
        score: 95,
        attempts: 2,
        wrongAnswers: [...]
      },
      ...
    },
    typingAttempts: {
      "part1": 2,
      ...
    },
    lastUpdated: "2025-12-16T13:00:00Z"
  },
  chapters: [...]
}
```

### Google Sheets 구조
```
시트명: UserData
컬럼: Name | Temperature | Progress (JSON) | LastUpdated
```

---

## 🚨 알려진 이슈 및 제한사항

1. **Google Sheets API 쿼터**
   - 일일 요청 제한 존재
   - 과도한 동기화 시 제한 가능

2. **LocalStorage 용량**
   - 브라우저별 5~10MB 제한
   - 대용량 데이터 시 문제 가능

3. **Canvas 렌더링 성능**
   - 문제 수가 많을 경우 렌더링 지연
   - 모바일에서 성능 저하 가능

4. **다중 탭 방지 한계**
   - 시크릿 모드에서 우회 가능
   - 다른 브라우저 사용 시 감지 불가

---

## 💡 업그레이드 시 고려사항

### 유지해야 할 핵심 기능
1. ✅ 3단계 학습 구조
2. ✅ 이론 타이핑 시스템 (94% 정확도)
3. ✅ 오답 노트 강제 복습
4. ✅ 온도 기반 게이미피케이션
5. ✅ Google Sheets 연동
6. ✅ 보안 기능 (복사 방지, 다중 탭 방지)

### 개선 가능 영역
1. 🔄 데이터베이스 구조 (멀티테넌시)
2. 🔄 API 버전 관리
3. 🔄 모바일 최적화
4. 🔄 AI 튜터 기능 완성
5. 🔄 실시간 협업 기능
6. 🔄 성능 최적화 (Canvas 렌더링)

---

## 📝 변경 이력

| 날짜 | 버전 | 주요 변경사항 |
|------|------|--------------|
| 2025-12-16 | v12 | 현재 버전 (문서 작성 시점) |
| 2025-12-08 | v11 | DevTools 감지 개선 |
| 2025-12-05 | v10 | Q&A 패널 추가 |
| 2025-12-04 | v9 | 데이터 정제 및 이론 개선 |
| 2025-12-03 | v8 | 대시보드 사이드 버튼 추가 |

---

**작성자**: Antigravity AI  
**최종 업데이트**: 2025-12-16 14:10 KST
