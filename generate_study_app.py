import json

# Theory Text (Cleaned up from OCR)
theory_text = """01. 3D 프린팅
① 개념
3D 모델러와 3D 프린터를 이용하여 3차원 CAD 데이터를 실제 물건으로 만들어내는 조형기술로, 우리가 흔히 알고 있는 원 소재를 깎아서 형상을 만드는 절삭가공과는 달리 소재를 층층이 쌓는 방식으로 형상을 만들어가는 가공방식입니다.

② 활용분야
• 기계 분야 : 자동차 부품, 항공 부품, 그 외 소형 및 대형 부품 등
• 의료 분야 : 의료용품, 임플란트, 보청기, 의수, 뼈, 신체장기 세포 등
• 전기전자 분야 : 스마트 기기 전자소자, 전기도금법을 이용한 금속 3D프린팅 등
• 패션 분야 : 액세서리, 의류, 화장품, 자동차 등
• 아트토이 분야 : 게임, 스포츠, 영화, 드라마, 만화의 캐릭터 및 피규어

02. 3D 프린터 운용기능사
① 개념
기존의 절삭 가공(Subtractive Manufacturing)의 한계를 벗어난 적층 제조(Additive Manufacturing)를 대표하는 3D프린터 산업에서 창의적인 아이디어를 실현하기 위해 시장조사, 제품스캐닝, 디자인 및 3D 모델링, 적층 시뮬레이션, 3D프린터 설정, 제품 출력, 후가공 등의 기능 업무를 수행할 숙련 기능인력 양성을 위한 자격입니다.

② 수행직무
DfAM(Design for Additive Manufacturing)을 이해하고 창의적인 제품을 설계하며, 3D 프린터를 기반으로 아이디어를 실현하기 위해 시장조사, 제품스캐닝, 디자인 및 3D 모델링, 출력용 데이터 확정, 3D 프린터 SW 설정, 3D 프린터 HW 설정, 제품 출력, 후가공, 장비 관리 및 작업자 안전사항 등의 직무를 수행합니다.

③ 진로 및 전망
글로벌 3D 프린터 산업은 해마다 지속적인 성장률을 보이고 있으며, 특히 제품 및 서비스 시장은 그 변화 폭이 크다고 할 수 있습니다. 최근 4차 산업혁명 관련 SW 대기업 및 제조업체의 3D 프린터 시장 진출로 항공우주, 자동차, 의료공학, 패션 등 다양한 분야에서 시장이 변화하고 있는 추세이므로 3D 프린터 운용 직무에 관한 지식과 숙련기능을 갖춘 전문 인력에 대한 수요가 증가할 전망입니다.

④ 시험정보
• 응시자격 : 연령, 학력, 경력, 성별, 지역 등에 제한을 두지 않음 (제한 없음)
• 필기
- 검정방법 : 객관식 4지 택일형 60문항 (60분)
- 합격기준 : 100점을 만점으로 하여 60점 이상
- 필기과목 : 제품 스캐닝, 3D 모델링, 3D프린터 SW 설정, 3D프린터 HW 설정, 제품출력, 3D프린팅 안전관리
• 실기
- 검정방법 : 작업형 (4시간 정도)
- 합격기준 : 100점을 만점으로 하여 60점 이상
- 실기과목 : 3D프린팅 운용 실무 (엔지니어링 모델링, 넙스 모델링, 폴리곤 모델링 등)"""

# Read Quiz JSON
with open('quiz.json', 'r', encoding='utf-8') as f:
    quiz_data = json.load(f)

# Filter valid questions
valid_questions = [q for q in quiz_data if q.get('choices') and (q.get('answer') or q.get('explanation'))]

# Create Data Structure
app_data = {
    "chapters": [
        {
            "id": "part0",
            "title": "Part 0: 제품 스캐닝 (기초 이론)",
            "theoryContent": theory_text,
            "questions": valid_questions
        }
    ]
}

json_str = json.dumps(app_data, ensure_ascii=False, indent=2)

# HTML Content (Using raw string to avoid f-string issues with JS)
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
            max-width: 1200px;
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
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #eee;
        }

        textarea {
            flex: 1;
            padding: 15px;
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
                card.className = 'chapter-card active'; // All active for now
                card.innerHTML = `
                    <h3>${chapter.title}</h3>
                    <p>이론 학습 + 문제 풀이</p>
                `;
                card.onclick = () => startTheory(chapter.id);
                grid.appendChild(card);
            });

            // Add placeholders for other parts
            for(let i=1; i<=9; i++) {
                if(i===4) continue; // Skip Part 4 as per user info
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
            const original = document.getElementById('theory-text').textContent.replace(/\\s+/g, '');
            const typed = document.getElementById('typing-input').value.replace(/\\s+/g, '');
            
            if (typed.length === 0) {
                showModal('알림', '내용을 입력해주세요.');
                return;
            }

            // Simple accuracy check (matching chars / total chars)
            let matchCount = 0;
            const len = Math.max(original.length, typed.length);
            const minLen = Math.min(original.length, typed.length);
            
            for(let i=0; i<minLen; i++) {
                if(original[i] === typed[i]) matchCount++;
            }
            
            const accuracy = Math.floor((matchCount / len) * 100);
            document.getElementById('accuracy-display').textContent = `정확도: ${accuracy}%`;

            if (accuracy >= 95) {
                showModal('성공!', '정확도 95%를 달성했습니다. 문제 풀이로 이동합니다.', () => {
                    startQuiz();
                });
            } else {
                showModal('실패', `정확도가 ${accuracy}% 입니다. 95% 이상이어야 합니다. 오타를 수정해서 다시 제출해주세요.`);
            }
        }

        // --- Quiz Mode ---
        function startQuiz() {
            const chapter = appData.chapters.find(c => c.id === currentChapterId);
            
            // Deep copy and shuffle questions
            currentQuestions = JSON.parse(JSON.stringify(chapter.questions));
            shuffleArray(currentQuestions);
            
            // Prepare questions (shuffle choices)
            currentQuestions.forEach(q => {
                // Identify correct index
                const answerText = q.answer || "";
                let correctIdx = -1;
                if (answerText.includes("1") || answerText.includes("①")) correctIdx = 0;
                else if (answerText.includes("2") || answerText.includes("②")) correctIdx = 1;
                else if (answerText.includes("3") || answerText.includes("③")) correctIdx = 2;
                else if (answerText.includes("4") || answerText.includes("④")) correctIdx = 3;
                q.correctOriginalIndex = correctIdx;

                // Clean and map choices
                q.shuffledChoices = q.choices.map((c, i) => ({
                    text: c.replace(/^[①②③④❶❷❸❹❺\\(\\d+\\)\\d+\\)]\\s*/, ''),
                    originalIndex: i
                }));
                shuffleArray(q.shuffledChoices);
                q.userSelection = null; // Reset selection
            });

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

                    // Use template literal for onclick
                    const onclickAttr = isReview ? '' : `onclick="selectQuizChoice(${idx}, ${cIdx})"`;
                    choicesHtml += `<li class="${className}" ${onclickAttr}>${labels[cIdx]} ${c.text}</li>`;
                });

                // Explanation (only in review)
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
            // Check if all answered
            if (currentQuestions.some(q => q.userSelection === null)) {
                showModal('알림', '모든 문제를 풀어주세요.');
                return;
            }

            // Calculate Score
            let correctCount = 0;
            currentQuestions.forEach(q => {
                const selected = q.shuffledChoices[q.userSelection];
                if (selected.originalIndex === q.correctOriginalIndex) correctCount++;
            });

            const score = Math.floor((correctCount / currentQuestions.length) * 100);
            
            renderQuizItems(true); // Show review
            document.getElementById('btn-submit-quiz').style.display = 'none';
            document.getElementById('btn-retry-quiz').style.display = 'inline-block';

            if (score >= 95) {
                showModal('축하합니다!', `점수: ${score}점 (통과)\\n학습을 완료했습니다!`);
                // Save progress logic here
            } else {
                showModal('아쉽네요', `점수: ${score}점 (불합격)\\n95점 이상이어야 합니다. 다시 풀어보세요.`);
            }
        }

        window.retryQuiz = function() {
            startQuiz(); // Restart
        }

        // Auto-login if saved
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
