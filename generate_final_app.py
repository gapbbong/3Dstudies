import json

# HTML Content
html_part1 = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 프린터 운용 기능사 학습 프로그램</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

        :root {
            --primary-color: #2c3e50; /* Dark Blue/Grey - Sophisticated */
            --secondary-color: #ecf0f1;
            --accent-color: #3498db; /* Calm Blue */
            --text-color: #34495e;
            --success-color: #27ae60;
            --error-color: #c0392b;
            --bg-color: #fdfdfd;
            --card-bg: #ffffff;
        }
        
        body {
            font-family: 'Noto Sans KR', sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Header - Removed "3D Printer Study" area, minimal height */
        header {
            background-color: transparent;
            padding: 20px;
            position: absolute;
            top: 0;
            right: 0;
            z-index: 100;
            width: 100%;
            pointer-events: none; /* Allow clicking through */
        }

        .user-info {
            float: right;
            font-size: 3em;
            font-weight: 900;
            color: #6c5ce7; /* High visibility Purple */
            text-shadow: 2px 2px 0px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; /* White outline */
            background: rgba(255, 255, 255, 0.8);
            padding: 5px 25px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            pointer-events: auto;
            border: 3px solid #6c5ce7;
            z-index: 200;
        }

        /* Main Container */
        main {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
            display: flex;
            justify-content: center;
            padding-top: 80px; /* Space for absolute header */
        }

        .screen {
            display: none;
            width: 100%;
            max-width: 1200px;
            animation: fadeIn 0.5s ease;
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
            max-width: 400px;
            margin: 100px auto;
            background: var(--card-bg);
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        
        #login-screen h1 {
            font-weight: 300;
            color: var(--primary-color);
            margin-bottom: 40px;
        }

        input[type="text"] {
            width: 100%;
            padding: 15px;
            font-size: 1.1em;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            transition: border 0.3s;
            box-sizing: border-box;
        }
        
        input[type="text"]:focus {
            border-color: var(--accent-color);
            outline: none;
        }

        button {
            padding: 15px 40px;
            font-size: 1em;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
            box-shadow: 0 4px 10px rgba(44, 62, 80, 0.2);
        }

        button:hover { 
            background-color: var(--accent-color); 
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(52, 152, 219, 0.3);
        }

        /* Dashboard */
        .dashboard-section {
            margin-bottom: 50px;
        }
        .dashboard-section h2 {
            font-weight: 300;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 30px;
            color: #7f8c8d;
            font-size: 1.5em;
        }

        .chapter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 30px;
        }

        .chapter-card {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
            position: relative;
            overflow: hidden;
        }

        .chapter-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 15px 35px rgba(0,0,0,0.08);
            border-color: var(--accent-color);
        }
        
        .chapter-card h3 {
            margin-top: 0;
            color: var(--primary-color);
            font-weight: 500;
        }

        .chapter-card.locked { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); }

        .progress-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 600;
            display: none;
        }
        
        .leaderboard-btn {
            position: fixed;
            bottom: 40px;
            right: 40px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5em;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 100;
            transition: transform 0.3s;
        }
        .leaderboard-btn:hover { transform: scale(1.1); }

        /* Theory Mode */
        .split-view {
            display: flex;
            gap: 40px;
            height: 75vh;
        }

        .theory-panel, .typing-panel {
            flex: 1;
            background: var(--card-bg);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            border: 1px solid #f0f0f0;
        }
        
        h3 { font-weight: 500; color: var(--primary-color); margin-top: 0; }

        .theory-content {
            flex: 1;
            overflow-y: auto;
            font-size: 1.05em;
            line-height: 1.8;
            white-space: pre-wrap;
            user-select: none;
            color: #555;
            padding-right: 10px;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #bdc3c7; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #95a5a6; }

        textarea {
            flex: 1;
            padding: 20px;
            font-size: 1.05em;
            line-height: 1.8;
            border: 1px solid #eee;
            border-radius: 10px;
            resize: none;
            font-family: 'Noto Sans KR', sans-serif;
            background-color: #fafafa;
            transition: background 0.3s;
        }
        textarea:focus { background-color: white; outline: none; border-color: var(--accent-color); }

        .status-bar {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .dashboard-actions {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 30px;
        }
        
        .icon-btn {
            font-size: 1.5em;
            background: white;
            border: none;
            cursor: pointer;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
        }
        .icon-btn:hover { transform: scale(1.1); }
        
        #accuracy-display { font-weight: 600; color: var(--accent-color); }

        /* Review Mode Styles */
        .review-item {
            background: #fff9e6;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 15px;
            border: 1px solid #fceabb;
        }
        .review-theory {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            color: #7f8c8d;
            line-height: 1.6;
            border: 1px solid #eee;
        }
        .review-input {
            width: 100%;
            height: 120px;
            margin-top: 15px;
            border: 1px solid #ddd;
            box-sizing: border-box;
        }
        .review-input.correct { border-color: var(--success-color); background-color: #f0f9f4; }
        .review-input.incorrect { border-color: var(--error-color); background-color: #fdf2f2; }

        /* Quiz Mode */
        .quiz-container {
            background: var(--card-bg);
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.03);
            max-width: 800px;
            margin: auto;
        }

        .question-item {
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .question-text {
            font-size: 1.2em;
            font-weight: 500;
            margin-bottom: 20px;
            color: var(--primary-color);
        }

        .choices {
            list-style-type: none;
            padding: 0;
        }

        .choice-item {
            padding: 15px 20px;
            margin: 10px 0;
            background: #f8f9fa;
            border: 1px solid #eee;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .choice-item:hover { background: #ecf0f1; transform: translateX(5px); }
        .choice-item.selected { background: #e8f6f3; border-color: var(--accent-color); color: var(--primary-color); font-weight: 500; }
        .choice-item.correct { background: #d5f5e3; color: #1e8449; border-color: #abebc6; }
        .choice-item.incorrect { background: #fadbd8; color: #c0392b; border-color: #f5b7b1; }
        
        .explanation {
            margin-top: 20px;
            padding: 20px;
            background: #fcf3cf;
            border-radius: 10px;
            color: #7d6608;
            display: none;
            line-height: 1.6;
        }

        .modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(44, 62, 80, 0.8); /* Dark overlay */
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }
        
        .modal-content h2 { margin-top: 0; color: var(--primary-color); }
        .modal-content p { font-size: 1.1em; color: #555; margin: 20px 0 30px; }
        
        /* Leaderboard Screen */
        #leaderboard-screen table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        #leaderboard-screen th, #leaderboard-screen td {
            padding: 15px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }
        #leaderboard-screen th { background-color: #f8f9fa; font-weight: 600; color: var(--primary-color); }
        #leaderboard-screen tr:hover { background-color: #fcfcfc; }

    </style>
</head>
<body>

    <header>
        <div class="user-info" id="display-name"></div>
    </header>

    <main>
        <!-- 1. Login Screen -->
        <div id="login-screen" class="screen active">
            <h1>3D Printer Study</h1>
            <input type="text" id="username-input" placeholder="학번+이름 (예: 2701홍길동) - 띄어쓰기 금지" autofocus>
            <button onclick="login()">학습 시작하기</button>
        </div>

        <!-- 2. Dashboard -->
        <div id="dashboard-screen" class="screen">
            <div class="dashboard-section">
                <h2>기초 학습</h2>
                <div class="chapter-grid" id="basic-chapter-grid"></div>
            </div>

            <div class="dashboard-section">
                <h2>심화 학습</h2>
                <div class="chapter-grid" id="advanced-chapter-grid"></div>
            </div>
            
            <div class="dashboard-actions">
                <button onclick="showAnalysis()" class="icon-btn" title="취약점 분석">📊</button>
                <button onclick="showLeaderboard()" class="icon-btn" title="전체 순위 보기">🏆</button>
            </div>
        </div>

        <!-- 3. Theory Mode -->
        <div id="theory-screen" class="screen">
            <div style="margin-bottom: 20px;">
                <button onclick="showScreen('dashboard-screen')" style="padding: 10px 20px; background: transparent; color: var(--text-color); border: 1px solid #ddd; box-shadow: none;">&lt; 뒤로가기</button>
                <span style="margin-left: 15px; font-weight: 600; font-size: 1.3em; color: var(--primary-color);" id="theory-title"></span>
            </div>
            <div class="split-view">
                <div class="theory-panel">
                    <h3>핵심 이론</h3>
                    <div class="theory-content" id="theory-text"></div>
                </div>
                <div class="typing-panel">
                    <h3>따라 쓰기 <span id="attempt-count" style="font-size: 0.8em; color: #7f8c8d;">(시도: 0/2)</span></h3>
                    <p style="font-size: 0.9em; color: #7f8c8d; margin-bottom: 10px;">💡 정확도 94% 달성 또는 2회 시도 후 스킵 가능</p>
                    <textarea id="typing-input" placeholder="왼쪽의 내용을 정확하게 따라 입력하세요..." onpaste="return false;" autocomplete="off"></textarea>
                    <div class="status-bar">
                        <span id="accuracy-display">정확도: 0%</span>
                        <button onclick="checkTyping()">제출하기</button>
                        <button id="skip-btn" onclick="startQuiz()" style="background-color: #95a5a6; margin-left: 10px; display: none;">스킵하기</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. Quiz Mode -->
        <div id="quiz-screen" class="screen">
            <div style="margin-bottom: 20px;">
                <button onclick="showScreen('dashboard-screen')" style="padding: 10px 20px; background: transparent; color: var(--text-color); border: 1px solid #ddd; box-shadow: none;">&lt; 뒤로가기</button>
                <span style="margin-left: 15px; font-weight: 600; font-size: 1.3em; color: var(--primary-color);">실전 문제 풀이</span>
                <span id="quiz-progress" style="float:right; font-weight:600; color: var(--accent-color);"></span>
            </div>
            <div class="quiz-container" id="quiz-content"></div>
            <div style="text-align: center; margin-top: 40px;">
                <button onclick="submitQuiz()" id="btn-submit-quiz">답안 제출</button>
                <button onclick="retryQuiz()" id="btn-retry-quiz" style="display:none; background-color: var(--accent-color);">다시 풀기</button>
            </div>
        </div>

        <!-- 5. Review Mode (Wrong Answers) -->
        <div id="review-screen" class="screen">
            <h1 style="text-align: center; font-weight: 300; color: var(--primary-color);">오답 노트 & 이론 복습</h1>
            <p style="text-align: center; color: #7f8c8d; margin-bottom: 40px;">틀린 문제의 핵심 이론(해설)을 직접 타이핑하여 복습하세요.</p>
            <div id="review-content" style="max-width: 800px; margin: auto;"></div>
            <div style="text-align: center; margin-top: 40px;">
                <button onclick="finishReview()" id="btn-finish-review" disabled style="background-color: #bdc3c7;">복습 완료</button>
            </div>
        </div>

        <!-- 6. Analysis Screen -->
        <div id="analysis-screen" class="screen">
            <div style="margin-bottom: 20px;">
                <button onclick="showScreen('dashboard-screen')" style="padding: 10px 20px; background: transparent; color: var(--text-color); border: 1px solid #ddd; box-shadow: none;">&lt; 뒤로가기</button>
                <span style="margin-left: 15px; font-weight: 600; font-size: 1.3em; color: var(--primary-color);">나의 취약점 분석</span>
            </div>
            <div class="analysis-container" style="max-width: 900px; margin: auto;">
                <div class="analysis-section" style="background: white; padding: 30px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h3>📉 취약 단원 (평균 60점 미만)</h3>
                    <ul id="weak-chapter-list" style="list-style: none; padding: 0;"></ul>
                </div>
                <div class="analysis-section" style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h3>❌ 자주 틀리는 문제 (Top 10)</h3>
                    <ul id="frequent-wrong-list" style="list-style: none; padding: 0;"></ul>
                    <button id="btn-weak-review" onclick="startWeaknessReview()" style="display:none; margin-top:15px; width:100%; background-color:#e74c3c;">취약 문제 집중 공략하기</button>
                </div>
            </div>
        </div>

        <!-- 7. Leaderboard Screen -->
        <div id="leaderboard-screen" class="screen">
            <div style="margin-bottom: 20px;">
                <button onclick="showScreen('dashboard-screen')" style="padding: 10px 20px; background: transparent; color: var(--text-color); border: 1px solid #ddd; box-shadow: none;">&lt; 뒤로가기</button>
                <span style="margin-left: 15px; font-weight: 600; font-size: 1.3em; color: var(--primary-color);">전체 순위 (Top 50)</span>
            </div>
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                <div id="leaderboard-loading" style="text-align: center; color: #999;">로딩 중...</div>
                <table id="leaderboard-table" style="display:none;">
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>이름</th>
                            <th>과목</th>
                            <th>점수</th>
                            <th>날짜</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-body"></tbody>
                </table>
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
    <!-- Load Data from External File -->
    <script src="data.js"></script>

    <script>
        window.onerror = function(msg, url, line, col, error) {
            alert("시스템 오류: " + msg + "\\n라인: " + line);
            return false;
        };

        // *** IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL ***
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygnCpNCQQeNcgl4NJs5Cst2Hp0Dti2zX0nkIShU0T2SrfzoFECrDI3Bh1eOQX9y5Yy/exec"; 

        // Global State
        let currentUser = '';
        
        // Initialize UserData
        appData.userData = {
            name: '',
            temperature: 10,
            typingAttempts: {},
            progress: {},
            stats: {},
            wrongCounts: {}
        };

        // --- Data Sync & Temperature ---
        function syncUserData() {
            if (!currentUser) return;
            
            const payload = {
                type: 'update_user_data',
                name: currentUser,
                temperature: appData.userData.temperature,
                typingAttempts: appData.userData.typingAttempts,
                progress: appData.userData.progress,
                stats: appData.userData.stats,
                wrongCounts: appData.userData.wrongCounts
            };

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => console.log("Synced")).catch(e => console.error(e));
        }

        function updateTemperature(amount) {
            let currentTemp = appData.userData.temperature || 10;
            let newTemp = Math.min(99, currentTemp + amount);
            if (newTemp !== currentTemp) {
                appData.userData.temperature = newTemp;
                updateTemperatureDisplay();
            }
        }
        
        function getTemperatureColor(temp) {
            if (temp <= 30) return '#3498db';
            if (temp <= 60) return '#2ecc71';
            if (temp <= 80) return '#e67e22';
            return '#e74c3c';
        }

        function updateTemperatureDisplay() {
            const temp = appData.userData.temperature || 10;
            const color = getTemperatureColor(temp);
            const displayEl = document.getElementById('display-name');
            if (displayEl) {
                displayEl.innerHTML = `${currentUser} <span style="color:${color}; font-weight:bold;">🌡️${temp}°</span>`;
            }
        }
        let currentChapterId = null;
        let currentQuestions = [];
        let wrongQuestions = [];
        let quizStartTime = 0;

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
            document.getElementById('modal-message').innerHTML = message.replace(/\\n/g, '<br>');
            document.getElementById('message-modal').style.display = 'flex';
            window.modalCallback = callback;
        }

        function closeModal() {
            document.getElementById('message-modal').style.display = 'none';
            if (window.modalCallback) window.modalCallback();
        }

        function levenshteinDistance(a, b) {
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                    else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
            return matrix[b.length][a.length];
        }

        // --- Login ---
        // --- Login ---
        function login() {
            try {
                if (typeof appData === 'undefined') {
                    alert('오류: data.js 파일을 찾을 수 없습니다.');
                    return;
                }

                const input = document.getElementById('username-input');
                const name = input.value.trim();
                
                if (!name) {
                    alert('이름을 입력해주세요.');
                    return;
                }
                
                if (name.includes(' ')) {
                    alert('이름에 띄어쓰기를 포함할 수 없습니다.\\n예: 2701홍길동');
                    return;
                }

                const validFormat = /^\d{4}\S+$/;
                if (!validFormat.test(name)) {
                    alert('학번 4자리와 이름을 붙여서 입력해주세요.\\n예: 2701홍길동');
                    return;
                }

                // Show loading
                input.disabled = true;
                input.value = "데이터 불러오는 중...";
                
                // Fetch User Data from Google Sheets
                const url = `${GOOGLE_SCRIPT_URL}?type=get_user_data&name=${encodeURIComponent(name)}`;
                
                fetch(url)
                .then(response => response.json())
                .then(json => {
                    if (json.status === 'success') {
                        currentUser = json.data.name;
                        appData.userData = json.data;
                        
                        // Ensure defaults
                        if (!appData.userData.temperature) appData.userData.temperature = 10;
                        if (!appData.userData.typingAttempts) appData.userData.typingAttempts = {};
                        if (!appData.userData.progress) appData.userData.progress = {};
                        if (!appData.userData.stats) appData.userData.stats = {};
                        if (!appData.userData.wrongCounts) appData.userData.wrongCounts = {};
                    advancedGrid.appendChild(card);
                }
            });

            // Placeholders
            for(let i=2; i<=8; i++) {
                const card = document.createElement('div');
                card.className = 'chapter-card locked';
                card.innerHTML = `<h3>Part ${i} (준비중)</h3><p>잠김</p>`;
                basicGrid.appendChild(card);
            }
            for(let i=9; i<=17; i++) {
                const card = document.createElement('div');
                card.className = 'chapter-card locked';
                card.innerHTML = `<h3>심화 Part ${i} (준비중)</h3><p>잠김</p>`;
                advancedGrid.appendChild(card);
            }
        }

    // --- Theory Mode ---
    let typingAttempts = 0;
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
                    choicesHtml += `<li class="${className}" ${onclickAttr}>${c.text}</li>`;
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
            // Calculate Score
            let correctCount = 0;
            wrongQuestions = [];
            
            currentQuestions.forEach((q, idx) => {
                if (q.userSelection === undefined || q.userSelection === null) {
                    // Unanswered
                } else {
                    const selectedChoice = q.shuffledChoices[q.userSelection];
                    if (selectedChoice.originalIndex === q.correctOriginalIndex) {
                        correctCount++;
                    } else {
                        wrongQuestions.push(q);
                    }
                }
            });

            const score = Math.round((correctCount / currentQuestions.length) * 100);
            
            // Update Temperature (+3 for completing quiz)
            updateTemperature(3);

            // Update Stats
            const stats = appData.userData.stats;
            if (!stats[currentChapterId]) {
                stats[currentChapterId] = { attempts: 0, bestScore: 0, totalScore: 0, avgScore: 0 };
            }
            stats[currentChapterId].attempts += 1;
            stats[currentChapterId].bestScore = Math.max(stats[currentChapterId].bestScore, score);
            stats[currentChapterId].totalScore += score;
            stats[currentChapterId].avgScore = Math.floor(stats[currentChapterId].totalScore / stats[currentChapterId].attempts);

            const wrongCount = currentQuestions.length - correctCount;
            const chapterTitle = appData.chapters.find(c => c.id === currentChapterId).title;

            // Update Wrong Counts
            const wrongCounts = appData.userData.wrongCounts;
            wrongQuestions.forEach(q => {
                const key = `${currentChapterId}_${q.number}`;
                wrongCounts[key] = (wrongCounts[key] || 0) + 1;
            });
            
            // Sync Data
            syncUserData();

            // Prepare Wrong Questions List for Sheet (Leaderboard)
            const wrongList = wrongQuestions.map(q => ({
                id: `Q${q.number}`,
                title: q.question
            }));

            // Post to Leaderboard
            if (GOOGLE_SCRIPT_URL) {
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name: currentUser, 
                        score: score,
                        chapter: chapterTitle,
                        wrong_questions: wrongList,
                        temperature: appData.userData.temperature
                    })
                }).catch(e => console.error("Leaderboard Error:", e));
            }

            if (wrongCount <= 1) {
                showModal('축하합니다!', `결과: ${wrongCount}개 틀림 (합격)\\n학습을 완료했습니다!`, () => {
                    initDashboard();
                    showScreen('dashboard-screen');
                });
            } else {
                showModal('불합격', `결과: ${wrongCount}개 틀림 (불합격)\\n틀린 문제의 이론을 복습해야 합니다.`, () => {
                    startReviewMode();
                });
            }
        }

        // --- Review Mode ---
        function startReviewMode() {
            const container = document.getElementById('review-content');
            container.innerHTML = '';
            
            wrongQuestions.forEach((q, idx) => {
                const item = document.createElement('div');
                item.className = 'review-item';
                item.innerHTML = `
                    <h4>문제: ${q.question}</h4>
                    <div class="review-theory">
                        <strong>핵심 이론(해설):</strong><br>
                        <span id="theory-target-${idx}">${q.explanation || "해설이 없습니다."}</span>
                    </div>
                    <textarea class="review-input" id="review-input-${idx}" placeholder="위의 해설을 그대로 따라 쓰세요..." onpaste="return false;" oninput="checkReviewProgress()"></textarea>
                `;
                container.appendChild(item);
            });
            
            showScreen('review-screen');
            checkReviewProgress();
        }

        window.checkReviewProgress = function() {
            let allCorrect = true;
            wrongQuestions.forEach((q, idx) => {
                const target = document.getElementById(`theory-target-${idx}`).textContent.replace(/\s+/g, '');
                const inputEl = document.getElementById(`review-input-${idx}`);
                const input = inputEl.value.replace(/\s+/g, '');
                
                if (target === input) {
                    inputEl.classList.add('correct');
                    inputEl.classList.remove('incorrect');
                } else {
                    inputEl.classList.add('incorrect');
                    inputEl.classList.remove('correct');
                    allCorrect = false;
                }
            });
            
            const btn = document.getElementById('btn-finish-review');
            btn.disabled = !allCorrect;
            btn.style.backgroundColor = allCorrect ? '#2ecc71' : '#bdc3c7';
        }

        window.finishReview = function() {
            // Increase Temperature +1
            updateTemperature(1);
            syncUserData();
            
             showModal('복습 완료', '수고하셨습니다! (온도 +1°)\\n다시 문제를 풀어보세요.', () => {
                document.getElementById('btn-retry-quiz').style.display = 'inline-block';
                showScreen('quiz-screen');
             });
        }

        window.retryQuiz = function() {
            startQuiz();
        }
        
        function formatDate(dateString) {
            const d = new Date(dateString);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const day = d.getDate();
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            const dayName = days[d.getDay()];
            const hours = d.getHours();
            const minutes = d.getMinutes();
            const seconds = d.getSeconds();
            
            return `${year}년 ${month}월 ${day}일 (${dayName}) ${hours}시 ${minutes}분 ${seconds}초`;
        }

        // --- Analysis ---
        function showAnalysis() {
            showScreen('analysis-screen');
            const stats = appData.userData.stats;
            const wrongCounts = appData.userData.wrongCounts;

            // 1. Weak Chapters
            const weakList = document.getElementById('weak-chapter-list');
            weakList.innerHTML = '';
            let hasWeakness = false;
            Object.keys(stats).forEach(chId => {
                if (stats[chId].avgScore < 60) {
                    const chTitle = appData.chapters.find(c => c.id === chId)?.title || chId;
                    const li = document.createElement('li');
                    li.textContent = `${chTitle} (평균 ${stats[chId].avgScore}점)`;
                    li.style.color = '#e74c3c';
                    weakList.appendChild(li);
                    hasWeakness = true;
                }
            });
            if (!hasWeakness) weakList.innerHTML = '<li>취약한 단원이 없습니다. 훌륭합니다! 👍</li>';

            // 2. Frequent Wrong Questions
            const wrongList = document.getElementById('frequent-wrong-list');
            wrongList.innerHTML = '';
            
            // Convert to array and sort
            const sortedWrongs = Object.keys(wrongCounts).map(key => {
                const [chId, qNum] = key.split('_');
                return { key, chId, qNum: parseInt(qNum), count: wrongCounts[key] };
            }).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10

            if (sortedWrongs.length > 0) {
                sortedWrongs.forEach(item => {
                    const chapter = appData.chapters.find(c => c.id === item.chId);
                    const question = chapter ? chapter.questions.find(q => q.number === item.qNum) : null;
                    if (question) {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <span class="badge">${item.count}회 틀림</span>
                            ${question.question.substring(0, 30)}...
                        `;
                        wrongList.appendChild(li);
                    }
                });
                document.getElementById('btn-weak-review').style.display = 'block';
                window.currentWeakQuestions = sortedWrongs;
            } else {
                wrongList.innerHTML = '<li>아직 틀린 문제가 충분하지 않습니다.</li>';
                document.getElementById('btn-weak-review').style.display = 'none';
            }
        }

        function startWeaknessReview() {
            if (!window.currentWeakQuestions || window.currentWeakQuestions.length === 0) return;
            
            const weakQs = [];
            window.currentWeakQuestions.forEach(item => {
                const chapter = appData.chapters.find(c => c.id === item.chId);
                if (chapter) {
                    const q = chapter.questions.find(q => q.number === item.qNum);
                    if (q) {
                        // Deep copy and add chapter info for context
                        const qCopy = JSON.parse(JSON.stringify(q));
                        qCopy.question = `[${chapter.title}] ${qCopy.question}`;
                        weakQs.push(qCopy);
                    }
                }
            });

            currentQuestions = weakQs;
            currentQuestions.forEach(q => {
                const answerText = q.answer || "";
                let correctIdx = -1;
                if (answerText.includes("1") || answerText.includes("①")) correctIdx = 0;
                else if (answerText.includes("2") || answerText.includes("②")) correctIdx = 1;
                else if (answerText.includes("3") || answerText.includes("③")) correctIdx = 2;
                else if (answerText.includes("4") || answerText.includes("④")) correctIdx = 3;
                q.correctOriginalIndex = correctIdx;

                q.shuffledChoices = q.choices.map((c, i) => ({
                    text: c.replace(/^[①②③④❶❷❸❹❺\(\d+\)\d+\)]\s*/, ''),
                    originalIndex: i
                }));
                shuffleArray(q.shuffledChoices);
                q.userSelection = null;
            });

            document.getElementById('quiz-progress').textContent = `집중 공략 ${currentQuestions.length}문제`;
            renderQuizItems();
            document.getElementById('btn-submit-quiz').style.display = 'inline-block';
            document.getElementById('btn-retry-quiz').style.display = 'none';
            
            quizStartTime = Date.now();
            showScreen('quiz-screen');
        }

        // --- Leaderboard ---
        window.showLeaderboard = function() {
            showScreen('leaderboard-screen');
            if (!GOOGLE_SCRIPT_URL) {
                document.getElementById('leaderboard-loading').innerHTML = 'Google Sheet URL이 설정되지 않았습니다.<br>관리자에게 문의하세요.';
                return;
            }
            
            fetch(`${GOOGLE_SCRIPT_URL}?type=get_leaderboard`)
                .then(res => res.json())
                .then(json => {
                    if (json.status === 'success') {
                        const data = json.data;
                        const tbody = document.getElementById('leaderboard-body');
                        tbody.innerHTML = '';
                        data.forEach((row, idx) => {
                            const tr = document.createElement('tr');
                            const formattedDate = formatDate(row.date);
                            tr.innerHTML = `<td>${idx+1}</td><td>${row.name}</td><td>${row.temperature}°</td><td>${row.score}</td><td>${formattedDate}</td>`;
                            tbody.appendChild(tr);
                        });
                        document.getElementById('leaderboard-loading').style.display = 'none';
                        document.getElementById('leaderboard-table').style.display = 'table';
                    } else {
                        document.getElementById('leaderboard-loading').textContent = '데이터 로드 실패: ' + json.message;
                    }
                })
                .catch(err => {
                    document.getElementById('leaderboard-loading').textContent = '데이터를 불러오는 중 오류가 발생했습니다.';
                    console.error(err);
                });
        }

        window.onload = () => {
            // No auto-login from localStorage anymore for security/lab environment
        }

    </script>
</body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_part1)
    print("Successfully generated index.html")
