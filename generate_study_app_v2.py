import json
import math

# 1. Refined Theory Text (Part 0: Product Scanning)
# ~1000 chars, clean formatting (1. 가. -)
theory_text = """1. 3D 스캐닝의 개념과 원리

가. 3D 스캐닝의 정의
- 3차원 스캐닝은 측정 대상물로부터 3차원 좌푯값(x, y, z)을 읽어내어 디지털 데이터로 변환하는 과정입니다.
- 일반 스캐닝이 문자나 2차원 형상을 읽는다면, 3D 스캐닝은 입체적인 형상 정보를 획득하여 3D 모델링 데이터로 재구성하는 기술입니다.

나. 스캐닝 방식의 분류
(1) 접촉식 스캐닝
- 원리: 터치 프로브(Touch Probe)가 물체 표면에 직접 닿아 좌표를 측정합니다.
- 장점: 투명하거나 반사되는 재질(거울 등)도 측정할 수 있습니다. 정밀도가 높습니다.
- 단점: 측정 속도가 느리고, 물체가 변형되기 쉬운 재질(고무 등)은 측정하기 어렵습니다.
- 대표 장비: CMM(3차원 측정기)

(2) 비접촉식 스캐닝
- 원리: 레이저나 빛(패턴)을 쏘아 반사되어 돌아오는 정보를 분석하여 측정합니다.
- 장점: 측정 속도가 빠르고, 물체의 변형 없이 측정할 수 있습니다.
- 단점: 투명하거나 검은색, 반사되는 표면은 측정이 어렵습니다(현상액 등을 뿌려야 함).
- 방식:
  - TOF(Time of Flight): 레이저가 돌아오는 시간을 측정. 장거리 측정에 유리.
  - 광삼각법: 레이저 발사각과 수신각을 이용해 거리 계산. 정밀도 우수.
  - 패턴광(Structured Light): 특정 패턴을 투영하여 굴곡을 분석. 속도가 매우 빠름.

2. 스캐너 결정 시 고려사항

가. 측정 대상물의 특징
- 크기: 대상물의 크기에 따라 핸드헬드형, 고정형, 광대역 스캐너 등을 선택해야 합니다.
- 재질: 투명하거나 반짝이는 재질은 접촉식을 쓰거나 전처리(현상액 도포) 후 비접촉식을 사용해야 합니다.
- 형상 복잡도: 내부 형상이나 복잡한 구조는 CT(컴퓨터 단층촬영) 방식이 유리할 수 있습니다.

나. 정밀도와 해상도
- 정밀도(Accuracy): 측정값이 실제값과 얼마나 일치하는지 나타냅니다.
- 해상도(Resolution): 얼마나 세밀하게 점 데이터를 획득할 수 있는지 나타냅니다.

3. 스캐닝 데이터 후처리

가. 점군(Point Cloud) 처리
- 노이즈 제거: 불필요한 점들을 삭제합니다.
- 정합(Registration): 여러 각도에서 찍은 데이터를 하나로 합칩니다.
- 병합(Merge): 중복된 데이터를 정리하여 하나의 덩어리로 만듭니다.

나. 메쉬(Mesh) 생성 및 보정
- 점 데이터를 삼각형 면(Polygon)으로 변환합니다.
- 구멍 메우기(Hole Filling): 스캔되지 않은 빈 공간을 채웁니다.
- 스무딩(Smoothing): 표면을 매끄럽게 다듬습니다."""

# 2. Load Extracted Questions
with open('part0_questions_v2.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Ensure we have images set to null (just in case)
for q in questions:
    q['image'] = None

# Create Data Structure
app_data = {
    "chapters": [
        {
            "id": "part0",
            "title": "Part 0: 제품 스캐닝 (완전 정복)",
            "theoryContent": theory_text,
            "questions": questions
        }
    ]
}

json_str = json.dumps(app_data, ensure_ascii=False, indent=2)

# HTML Content
html_part1 = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 프린터 운용 기능사 학습 프로그램</title>
    <style>
        :root {
            --primary-color: #4a90e2;
            --secondary-color: #f5f7fa;
            --text-color: #333;
            --success-color: #2ecc71;
            --error-color: #e74c3c;
        }
        
        body {
            font-family: 'Malgun Gothic', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #eef2f7;
            color: var(--text-color);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Header */
        header {
            background-color: white;
            padding: 15px 30px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.2em;
            font-weight: bold;
            color: var(--primary-color);
        }

        .user-info {
            font-weight: bold;
        }

        /* Main Container */
        main {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
            display: flex;
            justify-content: center;
        }

        .screen {
            display: none;
            width: 100%;
            max-width: 1400px; /* Wider for split view */
            animation: fadeIn 0.3s ease;
        }

        .screen.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Login Screen */
        #login-screen {
            text-align: center;
            max-width: 500px;
            margin: auto;
            background: white;
            padding: 50px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        #login-screen h1 { margin-bottom: 30px; }
        
        input[type="text"] {
            width: 80%;
            padding: 15px;
            font-size: 1.2em;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        button {
            padding: 15px 30px;
            font-size: 1.1em;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
        }

        button:hover { background-color: #357abd; }

        /* Dashboard */
        .chapter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }

        .chapter-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            cursor: pointer;
            transition: transform 0.2s;
            border-left: 5px solid #ddd;
        }

        .chapter-card:hover { transform: translateY(-5px); }
        .chapter-card.active { border-left-color: var(--primary-color); }
        .chapter-card.locked { opacity: 0.6; cursor: not-allowed; }

        /* Theory Mode */
        .split-view {
            display: flex;
            gap: 20px;
            height: 80vh;
        }

        .theory-panel, .typing-panel {
            flex: 1;
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
        }

        .theory-content {
            flex: 1;
            overflow-y: auto;
            font-size: 1.1em;
            line-height: 1.6;
            white-space: pre-wrap;
            user-select: none; /* Copy protection */
            background-color: #fafafa;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #eee;
            font-family: 'Malgun Gothic', sans-serif;
        }

        textarea {
            flex: 1;
            padding: 20px;
            font-size: 1.1em;
            line-height: 1.6;
            border: 2px solid #ddd;
            border-radius: 5px;
            resize: none;
            font-family: 'Malgun Gothic', sans-serif;
        }

        .status-bar {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        }

        /* Quiz Mode */
        .quiz-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            max-width: 800px;
            margin: auto;
        }

        .question-item {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }

        .question-text { font-size: 1.2em; font-weight: bold; margin-bottom: 15px; }
        
        .choices { list-style: none; padding: 0; }
        .choice-item {
            padding: 12px;
            margin: 8px 0;
            background: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 5px;
            cursor: pointer;
        }
        .choice-item:hover { background: #eef2f7; }
        .choice-item.selected { background: #d1e7dd; border-color: #badbcc; }
        
        /* Review Styles */
        .choice-item.correct { background: #d4edda; color: #155724; border-color: #c3e6cb; }
        .choice-item.incorrect { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
        
        .explanation {
            margin-top: 15px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 5px;
            color: #856404;
            display: none;
        }

        .modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
        }

    </style>
</head>
<body>

    <header>
        <div class="logo">3D Printer Study</div>
        <div class="user-info" id="display-name"></div>
    </header>

    <main>
        <!-- 1. Login Screen -->
        <div id="login-screen" class="screen active">
            <h1>학습 시작하기</h1>
            <p>이름(또는 학번)을 입력하세요.</p>
            <input type="text" id="username-input" placeholder="예: 101 홍길동" autofocus>
            <button onclick="login()">시작하기</button>
        </div>

        <!-- 2. Dashboard -->
        <div id="dashboard-screen" class="screen">
            <h1>학습 단원 선택</h1>
            <div class="chapter-grid" id="chapter-grid">
                <!-- Chapters will be generated here -->
            </div>
        </div>

        <!-- 3. Theory Mode -->
        <div id="theory-screen" class="screen">
            <div style="margin-bottom: 15px;">
                <button onclick="showScreen('dashboard-screen')" style="padding: 8px 15px; font-size: 0.9em; background: #7f8c8d;">&lt; 뒤로가기</button>
                <span style="margin-left: 10px; font-weight: bold; font-size: 1.2em;" id="theory-title"></span>
            </div>
            <div class="split-view">
                <div class="theory-panel">
                    <h3>핵심 이론 (읽기 전용)</h3>
                    <div class="theory-content" id="theory-text"></div>
                </div>
                <div class="typing-panel">
                    <h3>따라 쓰기</h3>
                    <textarea id="typing-input" placeholder="왼쪽의 내용을 정확하게 따라 입력하세요..."></textarea>
                    <div class="status-bar">
                        <span id="accuracy-display">정확도: 0%</span>
                        <button onclick="checkTyping()">제출하기</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. Quiz Mode -->
        <div id="quiz-screen" class="screen">
            <div style="margin-bottom: 15px;">
                <button onclick="showScreen('dashboard-screen')" style="padding: 8px 15px; font-size: 0.9em; background: #7f8c8d;">&lt; 뒤로가기</button>
                <span style="margin-left: 10px; font-weight: bold; font-size: 1.2em;">실전 문제 풀이</span>
                <span id="quiz-progress" style="float:right; font-weight:bold;"></span>
            </div>
            <div class="quiz-container" id="quiz-content">
                <!-- Questions -->
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="submitQuiz()" id="btn-submit-quiz">답안 제출</button>
                <button onclick="retryQuiz()" id="btn-retry-quiz" style="display:none; background-color: #f39c12;">다시 풀기</button>
            </div>
        </div>
    </main>

    <!-- Modal -->
    <div id="message-modal" class="modal">
        <div class="modal-content">
            <h2 id="modal-title">알림</h2>
            <p id="modal-message">내용</p>
            <button onclick="closeModal()">확인</button>
        </div>
    </div>

    <script>
"""

html_part2 = f"""
        const appData = {json_str};
"""

html_part3 = """
        let currentUser = '';
        let currentChapterId = null;
        let currentQuestions = [];

        // --- Utils ---
        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function showModal(title, message, callback) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('message-modal').style.display = 'flex';
            window.modalCallback = callback;
        }

        function closeModal() {
            document.getElementById('message-modal').style.display = 'none';
            if (window.modalCallback) window.modalCallback();
        }

        // Levenshtein Distance for sophisticated string comparison
        function levenshteinDistance(a, b) {
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1, // substitution
                            Math.min(
                                matrix[i][j - 1] + 1, // insertion
                                matrix[i - 1][j] + 1  // deletion
                            )
                        );
                    }
                }
            }
            return matrix[b.length][a.length];
        }

        // --- Login ---
        function login() {
            const input = document.getElementById('username-input');
            const name = input.value.trim();
            if (name) {
                currentUser = name;
                document.getElementById('display-name').textContent = `학생: ${currentUser}`;
                localStorage.setItem('lastUser', currentUser);
                initDashboard();
                showScreen('dashboard-screen');
            } else {
                alert('이름을 입력해주세요.');
            }
        }

        // --- Dashboard ---
        function initDashboard() {
            const grid = document.getElementById('chapter-grid');
            grid.innerHTML = '';
            
            appData.chapters.forEach(chapter => {
                const card = document.createElement('div');
                card.className = 'chapter-card active';
                card.innerHTML = `
                    <h3>${chapter.title}</h3>
                    <p>이론 학습 + 문제 풀이</p>
                    <p style="font-size:0.9em; color:#666;">문제 수: ${chapter.questions.length}문제</p>
                `;
                card.onclick = () => startTheory(chapter.id);
                grid.appendChild(card);
            });

            for(let i=1; i<=9; i++) {
                if(i===4) continue;
                const card = document.createElement('div');
                card.className = 'chapter-card locked';
                card.innerHTML = `<h3>Part ${i} (준비중)</h3><p>잠김</p>`;
                grid.appendChild(card);
            }
        }

        // --- Theory Mode ---
        function startTheory(chapterId) {
            currentChapterId = chapterId;
            const chapter = appData.chapters.find(c => c.id === chapterId);
            
            document.getElementById('theory-title').textContent = chapter.title;
            document.getElementById('theory-text').textContent = chapter.theoryContent;
            document.getElementById('typing-input').value = '';
            document.getElementById('accuracy-display').textContent = '정확도: 0%';
            
            showScreen('theory-screen');
        }

        function checkTyping() {
            // Normalize: remove all whitespace to compare content only
            const original = document.getElementById('theory-text').textContent.replace(/\\s+/g, '');
            const typed = document.getElementById('typing-input').value.replace(/\\s+/g, '');
            
            if (typed.length === 0) {
                showModal('알림', '내용을 입력해주세요.');
                return;
            }

            // Calculate similarity using Levenshtein Distance
            // Similarity = (MaxLength - Distance) / MaxLength
            const distance = levenshteinDistance(original, typed);
            const maxLength = Math.max(original.length, typed.length);
            const accuracy = Math.floor(((maxLength - distance) / maxLength) * 100);

            document.getElementById('accuracy-display').textContent = `정확도: ${accuracy}%`;

            if (accuracy >= 95) {
                showModal('성공!', '정확도 95%를 달성했습니다. 문제 풀이로 이동합니다.', () => {
                    startQuiz();
                });
            } else {
                showModal('실패', `정확도가 ${accuracy}% 입니다. (목표: 95%)\\n오타나 빠진 내용이 없는지 확인해주세요.`);
            }
        }

        // --- Quiz Mode ---
        function startQuiz() {
            const chapter = appData.chapters.find(c => c.id === currentChapterId);
            
            currentQuestions = JSON.parse(JSON.stringify(chapter.questions));
            shuffleArray(currentQuestions);
            
            currentQuestions.forEach(q => {
                const answerText = q.answer || "";
                let correctIdx = -1;
                if (answerText.includes("1") || answerText.includes("①")) correctIdx = 0;
                else if (answerText.includes("2") || answerText.includes("②")) correctIdx = 1;
                else if (answerText.includes("3") || answerText.includes("③")) correctIdx = 2;
                else if (answerText.includes("4") || answerText.includes("④")) correctIdx = 3;
                q.correctOriginalIndex = correctIdx;

                q.shuffledChoices = q.choices.map((c, i) => ({
                    text: c.replace(/^[①②③④❶❷❸❹❺\\(\\d+\\)\\d+\\)]\\s*/, ''),
                    originalIndex: i
                }));
                shuffleArray(q.shuffledChoices);
                q.userSelection = null;
            });

            document.getElementById('quiz-progress').textContent = `총 ${currentQuestions.length}문제`;
            renderQuizItems();
            document.getElementById('btn-submit-quiz').style.display = 'inline-block';
            document.getElementById('btn-retry-quiz').style.display = 'none';
            showScreen('quiz-screen');
        }

        function renderQuizItems(isReview = false) {
            const container = document.getElementById('quiz-content');
            container.innerHTML = '';

            currentQuestions.forEach((q, idx) => {
                const item = document.createElement('div');
                item.className = 'question-item';
                
                let choicesHtml = '';
                const labels = ['①', '②', '③', '④'];
                
                q.shuffledChoices.forEach((c, cIdx) => {
                    let className = 'choice-item';
                    if (q.userSelection === cIdx) className += ' selected';
                    
                    if (isReview) {
                        if (c.originalIndex === q.correctOriginalIndex) className += ' correct';
                        else if (q.userSelection === cIdx) className += ' incorrect';
                    }

                    const onclickAttr = isReview ? '' : `onclick="selectQuizChoice(${idx}, ${cIdx})"`;
                    choicesHtml += `<li class="${className}" ${onclickAttr}>${labels[cIdx]} ${c.text}</li>`;
                });

                let explanationHtml = '';
                if (isReview) {
                    let correctLabel = labels[q.shuffledChoices.findIndex(c => c.originalIndex === q.correctOriginalIndex)];
                    explanationHtml = `
                        <div class="explanation" style="display:block">
                            <strong>정답:</strong> ${correctLabel}<br>
                            <strong>해설:</strong> ${q.explanation || '해설 없음'}
                        </div>
                    `;
                }

                item.innerHTML = `
                    <div class="question-text">${idx + 1}. ${q.question}</div>
                    <ul class="choices">${choicesHtml}</ul>
                    ${explanationHtml}
                `;
                container.appendChild(item);
            });
        }

        window.selectQuizChoice = function(qIdx, cIdx) {
            currentQuestions[qIdx].userSelection = cIdx;
            renderQuizItems(false);
        }

        window.submitQuiz = function() {
            if (currentQuestions.some(q => q.userSelection === null)) {
                showModal('알림', '모든 문제를 풀어주세요.');
                return;
            }

            let correctCount = 0;
            currentQuestions.forEach(q => {
                const selected = q.shuffledChoices[q.userSelection];
                if (selected.originalIndex === q.correctOriginalIndex) correctCount++;
            });

            const score = Math.floor((correctCount / currentQuestions.length) * 100);
            
            renderQuizItems(true);
            document.getElementById('btn-submit-quiz').style.display = 'none';
            document.getElementById('btn-retry-quiz').style.display = 'inline-block';

            if (score >= 95) {
                showModal('축하합니다!', `점수: ${score}점 (통과)\\n학습을 완료했습니다!`);
            } else {
                showModal('아쉽네요', `점수: ${score}점 (불합격)\\n95점 이상이어야 합니다. 다시 풀어보세요.`);
            }
        }

        window.retryQuiz = function() {
            startQuiz();
        }

        window.onload = () => {
            const savedUser = localStorage.getItem('lastUser');
            if (savedUser) {
                document.getElementById('username-input').value = savedUser;
            }
        }

    </script>
</body>
</html>
"""

with open('study_app.html', 'w', encoding='utf-8') as f:
    f.write(html_part1 + html_part2 + html_part3)
    print("Successfully generated study_app.html")
