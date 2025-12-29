const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxDuptCcSFGPULQFH-BNOtDodq610O2Df9rXlM1LJCO1LyWcYPXoJZfLqj2ndd7ukI/exec';
let currentUser = null;
let currentQuestions = [];
let currentChapterId = null;
let quizStartTime = null;
let wrongQuestions = [];
let isUnsafeToLeave = false; // Prevent accidental exit
let hintViewCount = 0; // Track hint views for current chapter

// Global Error Handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// --- Page Leave Warning & Persistence ---
window.addEventListener('beforeunload', function (e) {
    if (isUnsafeToLeave) {
        e.preventDefault();
        e.returnValue = ''; // Standard for Chrome/Firefox
    }
});

// Admin Escape Shortcut (Ctrl + X)
window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
        // Only trigger if we are in a "locked" state (unsafe to leave)
        if (isUnsafeToLeave) {
            if (confirm("관리자 모드: 오답노트를 강제 종료하고 나가시겠습니까?")) {
                isUnsafeToLeave = false;
                clearReviewState();
                location.reload();
            }
        } else {
            // Dashboard Unlock Cheat
            if (confirm("관리자 모드: 모든 챕터를 잠금 해제하시겠습니까?")) {
                window.isDevUnlocked = true;
                initDashboard();
                alert("모든 챕터가 해제되었습니다.");
            }
        }
    }
});

function saveReviewState() {
    if (!currentUser || wrongQuestions.length === 0) return;
    const state = {
        currentUser: currentUser,
        userData: appData.userData,
        wrongQuestions: wrongQuestions,
        currentChapterId: currentChapterId
    };
    localStorage.setItem('pendingReviewState', JSON.stringify(state));
}

function clearReviewState() {
    localStorage.removeItem('pendingReviewState');
}

function restoreReviewState() {
    const saved = localStorage.getItem('pendingReviewState');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            if (state.currentUser && state.wrongQuestions && state.wrongQuestions.length > 0) {
                currentUser = state.currentUser;
                appData.userData = state.userData;
                wrongQuestions = state.wrongQuestions;
                currentChapterId = state.currentChapterId;

                // Restore environment
                updateTemperatureDisplay();
                updateDisplayName();

                isUnsafeToLeave = true;
                alert('오답노트를 완료하지 않았습니다!\n리뷰 화면으로 복귀합니다.');

                // Show side nav
                const sideNav = document.getElementById('side-nav');
                if (sideNav) sideNav.style.display = 'flex';

                startReviewMode();
                return true; // Restored successfully
            }
        } catch (e) {
            console.error("Failed to restore review state:", e);
            clearReviewState();
        }
    }
    return false;
}

// --- Dashboard Functions ---
function initDashboard() {
    const basicGrid = document.getElementById('basic-chapter-grid');
    const practiceGrid = document.getElementById('practice-chapter-grid');
    const advancedGrid = document.getElementById('advanced-chapter-grid');
    if (basicGrid) basicGrid.innerHTML = '';
    if (practiceGrid) practiceGrid.innerHTML = '';
    if (advancedGrid) advancedGrid.innerHTML = '';

    if (!appData || !appData.chapters) {
        console.error("appData.chapters is missing!");
        return;
    }
    console.log(`initDashboard: Found ${appData.chapters.length} chapters.`);

    // Render 2단계: 주제별 기출문제 (from practiceData)
    if (typeof practiceData !== 'undefined' && practiceData.chapters && practiceGrid) {
        console.log(`Found ${practiceData.chapters.length} practice chapters.`);
        practiceData.chapters.forEach((chapter, index) => {
            const card = document.createElement('div');
            card.className = 'chapter-card';
            card.onclick = () => startQuiz(chapter.id);
            card.innerHTML = `<h3>${chapter.title}</h3><p>${chapter.questions ? chapter.questions.length : 0}문제</p>`;

            // Add progress badge if available
            if (appData.userData && appData.userData.progress && appData.userData.progress[chapter.id] && appData.userData.progress[chapter.id].passed) {
                const badge = document.createElement('div');
                badge.className = 'progress-badge';
                badge.style.display = 'block';
                badge.textContent = '합격';
                card.appendChild(badge);
            }


            // Locking Logic for practice chapters
            let isLocked = false;

            // Check if this is the first practice chapter
            if (index === 0) {
                // First practice chapter requires all stage 1 (appData) chapters to be completed
                const allStage1Passed = appData.chapters.every(ch => {
                    const progress = appData.userData.progress ? appData.userData.progress[ch.id] : null;
                    return progress && progress.passed;
                });
                if (!allStage1Passed) {
                    isLocked = true;
                }
            } else {
                // Other practice chapters require previous practice chapter to be completed
                const prevChapter = practiceData.chapters[index - 1];
                const prevProgress = appData.userData.progress ? appData.userData.progress[prevChapter.id] : null;
                if (!prevProgress || !prevProgress.passed) {
                    isLocked = true;
                }
            }

            // Developer Cheat
            if (window.isDevUnlocked) isLocked = false;

            if (isLocked) {
                card.classList.add('locked');
                card.onclick = () => alert('이전 단계를 먼저 통과해야 합니다. (2개 이하로 틀려야 함)');
                card.innerHTML += `<div class="lock-overlay"></div>`;
            }

            practiceGrid.appendChild(card);
        });
    }


    // Render 3단계: 연도별 기출문제 (from advancedData)
    console.log('Checking advancedData:', typeof advancedData, advancedData);
    if (typeof advancedData !== 'undefined' && advancedData.chapters && advancedGrid) {
        console.log(`Found ${advancedData.chapters.length} advanced chapters.`);
        advancedData.chapters.forEach((chapter, index) => {
            const card = document.createElement('div');
            card.className = 'chapter-card';
            card.onclick = () => startQuiz(chapter.id);
            card.innerHTML = `<h3>${chapter.title}</h3><p>${chapter.questions ? chapter.questions.length : 0}문제</p>`;

            // Add progress badge if available
            if (appData.userData && appData.userData.progress && appData.userData.progress[chapter.id] && appData.userData.progress[chapter.id].passed) {
                const badge = document.createElement('div');
                badge.className = 'progress-badge';
                badge.style.display = 'block';
                badge.textContent = '합격';
                card.appendChild(badge);
            }

            // Locking Logic for advanced chapters
            let isLocked = false;

            // Check if this is the first advanced chapter
            if (index === 0) {
                // First advanced chapter requires all stage 2 (practiceData) chapters to be completed
                if (typeof practiceData !== 'undefined' && practiceData.chapters) {
                    const allStage2Passed = practiceData.chapters.every(ch => {
                        const progress = appData.userData.progress ? appData.userData.progress[ch.id] : null;
                        return progress && progress.passed;
                    });
                    if (!allStage2Passed) {
                        isLocked = true;
                    }
                }
            } else {
                // Other advanced chapters require previous advanced chapter to be completed
                const prevChapter = advancedData.chapters[index - 1];
                const prevProgress = appData.userData.progress ? appData.userData.progress[prevChapter.id] : null;
                if (!prevProgress || !prevProgress.passed) {
                    isLocked = true;
                }
            }

            // Developer Cheat
            if (window.isDevUnlocked) isLocked = false;

            if (isLocked) {
                card.classList.add('locked');
                card.onclick = () => alert('이전 단계를 먼저 통과해야 합니다. (2개 이하로 틀려야 함)');
                card.innerHTML += `<div class="lock-overlay"></div>`;
            }

            advancedGrid.appendChild(card);
        });
    }

    // Render 1단계: 기초 학습 (from appData)
    appData.chapters.forEach(chapter => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.onclick = () => startQuiz(chapter.id);
        card.innerHTML = `<h3>${chapter.title}</h3><p>${chapter.questions ? chapter.questions.length : 0}문제</p>`;

        // Add progress badge if available
        if (appData.userData && appData.userData.progress && appData.userData.progress[chapter.id] && appData.userData.progress[chapter.id].passed) {
            const badge = document.createElement('div');
            badge.className = 'progress-badge';
            badge.style.display = 'block';
            badge.textContent = '합격';
            card.appendChild(badge);
        }

        // Always add to Basic Grid (Show all chapters)
        if (basicGrid) basicGrid.appendChild(card);

        // Unlocking Logic
        let isLocked = false;
        if (chapter.id !== 'part1') { // Part 1 is always open
            const prevPartNum = parseInt(chapter.id.replace('part', '')) - 1;
            const prevPartId = 'part' + prevPartNum;

            // Check if previous part exists and is passed
            const prevProgress = appData.userData.progress ? appData.userData.progress[prevPartId] : null;
            if (!prevProgress || !prevProgress.passed) {
                isLocked = true;
            }
        }

        // Developer Cheat
        if (window.isDevUnlocked) isLocked = false;

        if (isLocked) {
            card.classList.add('locked');
            card.onclick = () => alert('이전 단계를 먼저 통과해야 합니다. (2개 이하로 틀려야 함)');
            card.innerHTML += `<div class="lock-overlay"></div>`;
        }
    });
}

// Update display name with current part info
function updateDisplayName() {
    const info = document.getElementById('display-name');
    if (info && currentUser) {

        // theory-screen에서만 PART 이름 표시
        const isTheory = document.getElementById('theory-screen')?.classList.contains('active');

        const partInfo = (isTheory && currentChapterId)
            ? `[${currentChapterId.toUpperCase()}] `
            : '';

        info.textContent = partInfo + currentUser;
    }
}

function startQuiz(chapterId) {
    if (chapterId) currentChapterId = chapterId;

    // Enable submit button
    const submitBtn = document.getElementById('btn-submit-quiz');
    if (submitBtn) submitBtn.disabled = false;

    // Try to find chapter in appData first, then practiceData, then advancedData
    let chapter = appData.chapters.find(c => c.id === currentChapterId);
    if (!chapter && typeof practiceData !== 'undefined' && practiceData.chapters) {
        chapter = practiceData.chapters.find(c => c.id === currentChapterId);
    }
    if (!chapter && typeof advancedData !== 'undefined' && advancedData.chapters) {
        chapter = advancedData.chapters.find(c => c.id === currentChapterId);
    }
    if (!chapter) return;

    isUnsafeToLeave = true; // Enable warning

    // Theory Mode first
    document.getElementById('theory-title').textContent = chapter.title;
    document.getElementById('theory-text').textContent = chapter.theoryContent || "이론 내용이 없습니다.";
    document.getElementById('typing-input').value = '';
    document.getElementById('accuracy-display').textContent = '정확도: 0%';

    // Add real-time accuracy check and arrow auto-replacement
    const typingInput = document.getElementById('typing-input');
    typingInput.oninput = function () {
        autoReplaceArrow(this);
        updateAccuracy();
    };

    // Prevent copy and paste
    typingInput.addEventListener('copy', function (e) {
        e.preventDefault();
        alert('복사는 허용되지 않습니다.');
        return false;
    });

    typingInput.addEventListener('paste', function (e) {
        e.preventDefault();
        alert('붙여넣기는 허용되지 않습니다. 직접 입력해주세요.');
        return false;
    });

    typingInput.addEventListener('cut', function (e) {
        e.preventDefault();
        alert('잘라내기는 허용되지 않습니다.');
        return false;
    });

    // Add beforeunload warning for typing in progress
    let typingWarningEnabled = false;
    typingInput.addEventListener('input', function () {
        // Enable warning if there's content
        typingWarningEnabled = this.value.trim().length > 0;
    });

    window.addEventListener('beforeunload', function (e) {
        if (typingWarningEnabled && document.getElementById('theory-screen').classList.contains('active')) {
            e.preventDefault();
            e.returnValue = '작성 중인 내용이 있는데, 지금 나가면 저장되지 않습니다. 정말 나가시겠습니까?';
            return e.returnValue;
        }
    });

    // Check if user already completed 2 typing attempts for this chapter
    const savedAttempts = appData.userData.typingAttempts?.[currentChapterId] || 0;

    // Update attempt count display
    const attemptCountEl = document.getElementById('attempt-count');
    if (attemptCountEl) {
        attemptCountEl.textContent = `(시도: ${savedAttempts}/2)`;
    }

    if (savedAttempts >= 2) {
        typingSuccessCount = savedAttempts;
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) {
            skipBtn.style.display = 'inline-block';
            skipBtn.textContent = '다음/스킵';
        }
    } else {
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) skipBtn.style.display = 'none';
    }
    typingSuccessCount = savedAttempts; // Initialize with saved count instead of 0
    if (document.getElementById('typing-input')) {
        document.getElementById('typing-input').dataset.lastSuccess = '';
    }

    // Update display name with current part
    updateDisplayName();

    // Prepare questions
    currentQuestions = JSON.parse(JSON.stringify(chapter.questions)); // Deep copy
    currentQuestions.forEach(q => {
        const answerText = q.answer || "";
        let correctIdx = -1;
        if (answerText.includes("1") || answerText.includes("①")) correctIdx = 0;
        else if (answerText.includes("2") || answerText.includes("②")) correctIdx = 1;
        else if (answerText.includes("3") || answerText.includes("③")) correctIdx = 2;
        else if (answerText.includes("4") || answerText.includes("④")) correctIdx = 3;
        q.correctOriginalIndex = correctIdx;

        q.shuffledChoices = q.choices.map((c, i) => ({
            text: c, // Keep original text with circles
            originalIndex: i
        }));
        shuffleArray(q.shuffledChoices);
        q.userSelection = null;
    });

    // Reset hint count for new chapter
    hintViewCount = 0;
    updateHintButton();

    showScreen('theory-screen');
    updateDisplayName(); // Update display with current part
}

function renderQuizItems() {
    const container = document.getElementById('quiz-content');
    container.innerHTML = '';

    currentQuestions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'question-item';

        // Question Text
        const qText = document.createElement('div');
        qText.className = 'question-text';
        qText.innerHTML = `<span class="question-number">Q${idx + 1}.</span> ${q.question}`;
        item.appendChild(qText);

        item.appendChild(document.createElement("br"));

        // Image if exists
        if (q.image) {
            const img = document.createElement('img');
            img.src = q.image;
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.marginTop = '20px';
            img.style.marginBottom = '10px';
            item.appendChild(img);
        }

        // Choices
        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices';

        q.shuffledChoices.forEach((choice, cIdx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            const circleNum = ['①', '②', '③', '④'][cIdx] || '';
            btn.textContent = `${circleNum} ${choice.text}`;
            btn.onclick = () => selectChoice(idx, cIdx);

            if (q.userSelection === cIdx) {
                btn.classList.add('selected');
            }

            choicesDiv.appendChild(btn);
        });
        item.appendChild(choicesDiv);

        container.appendChild(item);
    });
}

function selectChoice(qIdx, cIdx) {
    currentQuestions[qIdx].userSelection = cIdx;
    renderQuizItems();

    // Show hint button in quiz screen
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.style.display = 'flex';
        updateHintButton();
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);

    // Show/hide hint button based on screen
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        if (screenId === 'quiz-screen') {
            hintBtn.style.display = 'flex';
        } else {
            hintBtn.style.display = 'none';
        }
    }

    // Show/hide Q&A button based on screen (Theory only)
    const qnaBtn = document.getElementById('qna-btn');
    if (qnaBtn) {
        if (screenId === 'theory-screen') {
            qnaBtn.style.display = 'flex';
        } else {
            qnaBtn.style.display = 'none';
            // Also close the panel if we leave the theory screen
            if (typeof closeQnaPanel === 'function') closeQnaPanel();
        }
    }
}

function showModal(title, message, callback) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('message-modal').style.display = 'block';
    window.modalCallback = callback;
}

function closeModal() {
    document.getElementById('message-modal').style.display = 'none';
    if (window.modalCallback) {
        window.modalCallback();
        window.modalCallback = null;
    }
}

// --- Hint Modal Functions ---
function showHintModal() {
    // Check if hint limit reached
    if (hintViewCount >= 2) {
        alert('힌트를 이미 2번 모두 사용했습니다.');
        return;
    }

    // Get current chapter's theory content
    let chapter = appData.chapters.find(c => c.id === currentChapterId);
    if (!chapter && typeof practiceData !== 'undefined' && practiceData.chapters) {
        chapter = practiceData.chapters.find(c => c.id === currentChapterId);
    }
    if (!chapter && typeof advancedData !== 'undefined' && advancedData.chapters) {
        chapter = advancedData.chapters.find(c => c.id === currentChapterId);
    }

    if (!chapter || !chapter.theoryContent) {
        alert('힌트를 사용할 수 없습니다.');
        return;
    }

    // Increment hint view count
    hintViewCount++;

    // Update hint button
    updateHintButton();

    // Show modal with theory content
    const hintContent = document.getElementById('hint-content');
    hintContent.textContent = chapter.theoryContent;

    // Add copy prevention event listeners
    hintContent.addEventListener('copy', preventCopy);
    hintContent.addEventListener('cut', preventCopy);
    hintContent.addEventListener('contextmenu', preventCopy);

    document.getElementById('hint-modal').style.display = 'block';
}

function closeHintModal() {
    document.getElementById('hint-modal').style.display = 'none';
}

function preventCopy(e) {
    e.preventDefault();
    alert('힌트 내용은 복사할 수 없습니다.');
    return false;
}

function updateHintButton() {
    const hintBtn = document.getElementById('hint-btn');
    const hintBtnText = document.getElementById('hint-btn-text');

    if (!hintBtn || !hintBtnText) return;

    if (hintViewCount >= 2) {
        hintBtn.classList.add('disabled');
        hintBtnText.textContent = '힌트 소진';
    } else {
        hintBtn.classList.remove('disabled');
        hintBtnText.textContent = `힌트 (${hintViewCount}/2)`;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

let typingSuccessCount = 0; // Track successful typing attempts

function calculateLevenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Fixed checkTyping for Sync
async function checkTyping() {
    const input = document.getElementById('typing-input').value.replace(/\s+/g, '');
    const target = document.getElementById('theory-text').textContent.replace(/\s+/g, '');
    const accuracyEl = document.getElementById('accuracy-display');

    if (target.length === 0) {
        accuracyEl.textContent = '작성량: 0%';
        return;
    }

    const distance = calculateLevenshteinDistance(input, target);
    const maxLength = Math.max(input.length, target.length);
    const accuracy = Math.floor(((maxLength - distance) / maxLength) * 100);
    const finalAccuracy = Math.max(0, accuracy);
    const lengthRatio = input.length / target.length;

    // Show accuracy on submit
    accuracyEl.textContent = `정확도: ${finalAccuracy}% | 작성량: ${Math.floor(lengthRatio * 100)}%`;

    if (finalAccuracy >= 94) {
        if (lengthRatio < 0.98) {
            alert(`정확도는 높지만 내용이 부족합니다. (${Math.floor(lengthRatio * 100)}% 작성됨)\n98% 이상 작성해주세요.`);
            return;
        }

        // Prevent multiple alerts for the same input
        if (document.getElementById('typing-input').dataset.lastSuccess === input) return;
        document.getElementById('typing-input').dataset.lastSuccess = input;

        typingSuccessCount++;

        // Update typingAttempts in appData for Google Sheets sync
        if (!appData.userData.typingAttempts) appData.userData.typingAttempts = {};
        appData.userData.typingAttempts[currentChapterId] = typingSuccessCount;
        localStorage.setItem('appData', JSON.stringify(appData));

        // Update attempt count display
        const attemptCountEl = document.getElementById('attempt-count');
        if (attemptCountEl) {
            attemptCountEl.textContent = `(시도: ${typingSuccessCount}/2)`;
        }

        // Sync to Google Sheets (Async wait)
        try {
            await syncUserData();
        } catch (e) {
            console.error("Sync failed:", e);
        }

        if (typingSuccessCount < 2) {
            alert(`정확도 94% 달성! (1/2회 성공)\n완벽한 암기를 위해 한 번 더 입력해주세요.\n입력창이 초기화됩니다.`);
            document.getElementById('typing-input').value = '';
            document.getElementById('typing-input').dataset.lastSuccess = ''; // Reset for next attempt
            accuracyEl.textContent = '작성량: 0%';
        } else {
            const skipBtn = document.getElementById('skip-btn');
            if (skipBtn) {
                skipBtn.style.display = 'inline-block';
                skipBtn.textContent = '다음/스킵';
            }
            alert('정확도 94% 달성! (2/2회 성공)\n이제 퀴즈를 시작할 수 있습니다.');
        }
    } else {
        alert(`정확도가 ${finalAccuracy}% 입니다. (목표: 94%)\n오타나 빠진 내용이 없는지 확인해주세요.`);
    }
}

function updateAccuracy() {
    const input = document.getElementById('typing-input').value.replace(/\s+/g, '');
    const target = document.getElementById('theory-text').textContent.replace(/\s+/g, '');
    const accuracyEl = document.getElementById('accuracy-display');

    if (target.length === 0) {
        accuracyEl.textContent = '작성량: 0%';
        return;
    }

    const lengthRatio = input.length / target.length;
    const lengthPercent = Math.floor(lengthRatio * 100);

    // Only show completion percentage in real-time
    if (lengthRatio >= 0.98) {
        accuracyEl.style.color = '#2ecc71'; // Green
        accuracyEl.style.fontWeight = 'bold';
        accuracyEl.textContent = `작성량: ${lengthPercent}% ✓`;
    } else if (lengthRatio >= 0.90) {
        accuracyEl.style.color = '#e67e22'; // Orange
        accuracyEl.style.fontWeight = 'bold';
        accuracyEl.textContent = `작성량: ${lengthPercent}%`;
    } else {
        accuracyEl.style.color = ''; // Reset
        accuracyEl.style.fontWeight = '';
        accuracyEl.textContent = `작성량: ${lengthPercent}%`;
    }
}

function autoReplaceArrow(element) {
    const val = element.value;
    if (val.includes('--')) {
        const cursor = element.selectionStart;
        const newVal = val.replace(/--/g, '→');
        element.value = newVal;

        // Adjust cursor position (subtract 1 for each replacement before cursor)
        const diff = val.length - newVal.length;
        element.setSelectionRange(cursor - diff, cursor - diff);
    }
}

// --- Login ---
function login() {
    try {
        console.log('Login started...');
        if (typeof appData === 'undefined') {
            alert('오류: data.js 파일을 찾을 수 없습니다.');
            return;
        }

        const input = document.getElementById('username-input');
        const name = input.value.trim();

        // --- MOCK LOGIN FOR TESTING ---
        if (name === '2701test') {
            console.log('Test mode: Loading mock data');
            const mockData = {
                status: 'success',
                data: {
                    name: '2701test',
                    temperature: 10,
                    typingAttempts: {},
                    progress: {},
                    stats: {},
                    wrongCounts: {}
                }
            };

            input.disabled = true;
            input.value = "테스트 데이터 로드 중...";

            setTimeout(() => {
                currentUser = mockData.data.name;
                appData.userData = mockData.data;
                updateTemperatureDisplay();
                updateDisplayName(); // [FIX] Update name display
                initDashboard();

                // Show side nav
                const sideNav = document.getElementById('side-nav');
                if (sideNav) sideNav.style.display = 'flex';

                showScreen('dashboard-screen');
            }, 500);
            return;
        }
        // -----------------------------

        if (!name) {
            alert('이름을 입력해주세요.');
            return;
        }

        if (name.includes(' ')) {
            alert('이름에 띄어쓰기를 포함할 수 없습니다.\n예: 2701홍길동');
            return;
        }

        const validFormat = /^\d{4}\S+$/;
        if (!validFormat.test(name)) {
            alert('학번 4자리와 이름을 붙여서 입력해주세요.\n예: 2701홍길동');
            return;
        }

        // Show loading
        showLoading("데이터 불러오는 중...");
        console.log('Fetching data from: ' + GOOGLE_SCRIPT_URL);

        // Fetch User Data from Google Sheets
        const url = `${GOOGLE_SCRIPT_URL}?type=get_user_data&name=${encodeURIComponent(name)}`;

        fetch(url)
            .then(response => {
                console.log('Response received: ' + response.status);
                return response.json();
            })
            .then(json => {
                console.log('JSON parsed: ' + JSON.stringify(json));
                if (json.status === 'success') {
                    currentUser = json.data.name;
                    appData.userData = json.data;
                    console.log('Loaded userData:', JSON.stringify(appData.userData)); // [DEBUG] Check loaded data

                    // Ensure defaults
                    if (!appData.userData.temperature) appData.userData.temperature = 10;
                    if (!appData.userData.typingAttempts) appData.userData.typingAttempts = {};
                    if (!appData.userData.progress) appData.userData.progress = {};
                    if (!appData.userData.stats) appData.userData.stats = {};
                    if (!appData.userData.wrongCounts) appData.userData.wrongCounts = {};

                    updateTemperatureDisplay();
                    updateDisplayName(); // [FIX] Update name display
                    initDashboard();
                    hideLoading();

                    // Show side nav
                    const sideNav = document.getElementById('side-nav');
                    if (sideNav) sideNav.style.display = 'flex';

                    showScreen('dashboard-screen');
                } else {
                    hideLoading();
                    alert('데이터 로드 실패: ' + json.message);
                    input.disabled = false;
                    input.value = name;
                }
            })
            .catch(e => {
                hideLoading();
                console.error('Error: ' + e.message);
                alert('서버 연결 오류: ' + e.message + '\n인터넷 연결을 확인하세요.');
                input.disabled = false;
                input.value = name;
            });

    } catch (e) {
        console.error('Exception: ' + e.message);
        alert('로그인 중 오류 발생: ' + e.message);
    }
}

// --- Data Sync & Temperature ---
function updateTemperature(amount) {
    appData.userData.temperature += amount;
    // Round to 1 decimal place to avoid floating point errors
    appData.userData.temperature = Math.round(appData.userData.temperature * 10) / 10;
    updateTemperatureDisplay();
}

function getRankInfo(temp) {
    if (temp >= 150) return { title: '챔피언', icon: '🏆', color: '#f1c40f' }; // Gold
    if (temp >= 100) return { title: '전문가', icon: '💎', color: '#9b59b6' }; // Purple
    if (temp >= 81) return { title: '마스터', icon: '⚡', color: '#e74c3c' }; // Red
    if (temp >= 51) return { title: '열정가', icon: '🔥', color: '#f39c12' }; // Orange
    if (temp >= 21) return { title: '학습자', icon: '🌱', color: '#2ecc71' }; // Green
    return { title: '초보자', icon: '🧊', color: '#3498db' }; // Blue
}

function updateTemperatureDisplay() {
    const tempEl = document.getElementById('user-temperature');
    if (tempEl) {
        const temp = appData.userData.temperature;
        const rank = getRankInfo(temp);

        // 이름은 빼고 온도 + 등급만 표시
        tempEl.innerHTML = `<span style="font-weight:bold">${temp}°</span> 
            <span style="font-size:0.9em">${rank.icon} ${rank.title}</span>`;
        tempEl.style.color = rank.color;
    }
}

// --- Save Status UI ---
function showSaveStatus(message, type = 'loading') {
    let overlay = document.getElementById('save-status-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'save-status-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
        `;
        document.body.appendChild(overlay);
    }

    let icon = '';
    if (type === 'loading') icon = '<div class="spinner" style="border-color: #ffffff; border-top-color: transparent; margin-bottom: 20px;"></div>';
    else if (type === 'success') icon = '<div style="font-size: 3rem; margin-bottom: 20px;">✅</div>';
    else if (type === 'error') icon = '<div style="font-size: 3rem; margin-bottom: 20px;">❌</div>';

    overlay.innerHTML = `${icon}<div>${message}</div>`;
    overlay.style.display = 'flex';
}

function hideSaveStatus() {
    const overlay = document.getElementById('save-status-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.remove();
    }
}

function syncUserData() {
    if (!currentUser) return Promise.resolve();

    // Part 6 exclusion removed so it saves like other chapters


    showSaveStatus("데이터 저장 중...", "loading");

    const payload = {
        type: 'update_user_data',
        name: currentUser,
        temperature: appData.userData.temperature,
        typingAttempts: appData.userData.typingAttempts,
        progress: appData.userData.progress,
        stats: appData.userData.stats,
        wrongCounts: appData.userData.wrongCounts
    };

    // Use text/plain to avoid CORS preflight (OPTIONS) request
    // Google Apps Script can still parse the body
    return fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
        .then(() => {
            console.log("Synced");
            showSaveStatus("저장 완료!", "success");
            // 1초 후 오버레이 제거
            return new Promise(resolve => setTimeout(() => {
                hideSaveStatus();
                resolve();
            }, 1000));
        })
        .catch(e => {
            console.error(e);
            showSaveStatus("저장 실패! 다시 시도해주세요.", "error");
            // 2초 후 닫기
            return new Promise((resolve, reject) => setTimeout(() => {
                hideSaveStatus();
                reject(e);
            }, 2000));
        });
}

window.submitQuiz = async function () {
    const submitBtn = document.getElementById('btn-submit-quiz');
    if (submitBtn) submitBtn.disabled = true;
    // Calculate Score
    // Calculate Score & Temperature
    // Rule: Correct +1.5, Wrong -0.5
    // Combo Bonus: 3 streak (+1), 5 streak (+3), 10 streak (+5)

    let combo = 0;
    let maxCombo = 0;
    let comboBonus = 0;
    let correctCount = 0;
    wrongQuestions = [];

    currentQuestions.forEach((q, idx) => {
        let isCorrect = false;
        if (q.userSelection !== undefined && q.userSelection !== null) {
            const selectedChoice = q.shuffledChoices[q.userSelection];
            if (selectedChoice.originalIndex === q.correctOriginalIndex) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            correctCount++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;

            // Combo Bonuses (Triggered at specific milestones)
            if (combo === 3) comboBonus += 1;
            if (combo === 5) comboBonus += 3;
            if (combo === 10) comboBonus += 5;
        } else {
            combo = 0; // Reset combo
            wrongQuestions.push(q);
        }
    });

    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const incorrectAnswersCount = wrongQuestions.length;

    // Calculate Temperature Change
    let tempChange = (correctCount * 1.5) - (incorrectAnswersCount * 0.5);
    tempChange += comboBonus;

    const chapterTitle = appData.chapters.find(c => c.id === currentChapterId).title;
    const wrongCount = currentQuestions.length - correctCount;

    // Apply Temperature Change & Update Stats/Progress
    // Apply Temperature
    updateTemperature(tempChange);

    // Update Stats
    const stats = appData.userData.stats;
    if (!stats[currentChapterId]) {
        stats[currentChapterId] = { attempts: 0, bestScore: 0, totalScore: 0, avgScore: 0 };
    }
    stats[currentChapterId].attempts += 1;
    stats[currentChapterId].bestScore = Math.max(stats[currentChapterId].bestScore, score);
    stats[currentChapterId].totalScore += score;
    stats[currentChapterId].avgScore = Math.floor(stats[currentChapterId].totalScore / stats[currentChapterId].attempts);

    // Update Wrong Counts
    const wrongCounts = appData.userData.wrongCounts;
    wrongQuestions.forEach(q => {
        const key = `${currentChapterId}_${q.number}`;
        wrongCounts[key] = (wrongCounts[key] || 0) + 1;
    });

    // Update Progress (Passed / Mastery)
    if (!appData.userData.progress[currentChapterId]) {
        appData.userData.progress[currentChapterId] = {};
    }
    const prog = appData.userData.progress[currentChapterId];

    if (score >= 80) {
        prog.passed = true;
        prog.masteryCount = (prog.masteryCount || 0) + 1;
    }

    // Sync Data (Moved to after modal confirmation)
    /*
    try {
        await syncUserData();
    } catch (e) {
        console.error("Sync failed during submit:", e);
    }
    */

    // Prepare Wrong Questions List for Sheet (Leaderboard)
    const wrongListString = wrongQuestions.map(q => `Q${q.number}: ${q.question}`).join(' | ');

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
                wrong_questions: wrongListString, // Send as string (fixed key to match previous)
                temperature: appData.userData.temperature
            })
        }).catch(e => console.error("Leaderboard Error:", e));
    }

    if (score >= 80) {
        if (wrongCount === 0) showFireworks();

        // Passed: Safe to leave
        isUnsafeToLeave = false;
        clearReviewState();

        let msg = `결과: ${wrongCount}개 틀림 (합격)\n`;
        msg += `획득 온도: ${tempChange > 0 ? '+' : ''}${tempChange}°\n`;
        if (comboBonus > 0) msg += `🔥 콤보 보너스: +${comboBonus}°\n`;
        msg += `현재 온도: ${appData.userData.temperature}°`;

        showModal('축하합니다!', msg, () => {
            syncUserData().finally(() => {
                initDashboard();
                showScreen('dashboard-screen');
            });
        });
    } else {
        // Failed: Must review
        isUnsafeToLeave = true;
        saveReviewState(); // Save immediately in case they refresh during modal

        let msg = `결과: ${wrongCount}개 틀림 (불합격)\n`;
        msg += `온도 변화: ${tempChange > 0 ? '+' : ''}${tempChange}°\n`;
        msg += `틀린 문제의 이론을 복습해야 합니다.`;

        showModal('불합격', msg, () => {
            syncUserData().finally(() => {
                startReviewMode();
            });
        });
    }
}

// --- Review Mode ---
function startReviewMode() {
    isUnsafeToLeave = true;
    saveReviewState(); // Ensure state is saved

    const container = document.getElementById('review-content');
    container.innerHTML = '';

    wrongQuestions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.innerHTML = `
        <h4>문제: ${q.question}</h4>
        <div class="review-theory">
            <span style="font-weight: 300; font-size: 0.9em;">핵심 이론(해설):</span><br>
            <span id="theory-target-${idx}" style="font-weight: 600; font-size: 1.1em; line-height: 1.8;">${q.explanation || "해설이 없습니다."}</span>
        </div>
        <textarea class="review-input" id="review-input-${idx}" placeholder="위의 해설을 그대로 따라 쓰세요..."
             style="min-height: 40px;"></textarea>
        `;
        container.appendChild(item);

        const textarea = document.getElementById(`review-input-${idx}`);

        // Add auto-replace and progress check
        textarea.addEventListener('input', function () {
            autoReplaceArrow(this);
            checkReviewProgress();
        });

        // Add paste prevention
        textarea.addEventListener('paste', function (e) {
            e.preventDefault();
            alert('붙여넣기는 허용되지 않습니다. 직접 입력해주세요.');
            return false;
        });
    });

    showScreen('review-screen');
    checkReviewProgress();
    enterReviewMode();
}

window.checkReviewProgress = function () {
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

window.finishReview = function () {
    // Increase Temperature +1
    updateTemperature(1);
    syncUserData();

    // Finished: Safe to leave
    isUnsafeToLeave = false;
    clearReviewState();

    showModal('복습 완료', '수고하셨습니다! (온도 +1°)\n다시 문제를 풀어보세요.', () => {
        startQuiz();
    });
    if (typeof finishReviewMode === 'function') {
        finishReviewMode();
    }
}

window.retryQuiz = function () {
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
            const q = chapter.questions.find(q => q.number === String(item.qNum).padStart(2, '0'));
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
            text: c, // Keep original text with circles
            originalIndex: i
        }));
        shuffleArray(q.shuffledChoices);
        q.userSelection = null;
    });

    document.getElementById('quiz-progress').textContent = `집중 공략 ${currentQuestions.length}문제`;
    renderQuizItems();
    document.getElementById('btn-submit-quiz').style.display = 'inline-block';
    document.getElementById('btn-submit-quiz').disabled = false;
    document.getElementById('btn-retry-quiz').style.display = 'none';

    quizStartTime = Date.now();
    isUnsafeToLeave = true; // Enable warning
    showScreen('quiz-screen');
}

// --- Leaderboard ---
window.showLeaderboard = function () {
    showScreen('leaderboard-screen');

    const classId = currentUser.substring(0, 2); // 예: 2701

    document.getElementById('leaderboard-loading').textContent = "랭킹 불러오는 중...";
    document.getElementById('leaderboard-table').style.display = "none";

    fetch(`${GOOGLE_SCRIPT_URL}?type=class_temperature_ranking&classId=${classId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('leaderboard-body');
            tbody.innerHTML = '';

            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
              <td>${index + 1}</td>
              <td>${row.name}</td>
              <td>${row.temperature}°</td> 
          `;
                tbody.appendChild(tr);
            });

            document.getElementById('leaderboard-table').style.display = "table";
        })
        .catch(err => {
            console.error(err);
        });

};
window.onload = () => {
    // Try to restore review state first
    if (restoreReviewState()) {
        return; // Skip normal init
    }
    displayRandomQuote();
}

// --- Helper Functions ---
const QUOTES = [
    "성공은 매일 반복되는 작은 노력들의 합이다. - 로버트 콜리어",
    "기회는 일어나는 것이 아니라 만들어내는 것이다. - 크리스 그로서",
    "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병이다. - 아인슈타인",
    "멈추지 않는 한 얼마나 천천히 가는지는 중요하지 않다.",
    "학습은 우연히 얻어지는 것이 아니라 열정과 부지런함으로 찾아야 한다. - 아비가일 아담스",
    "전문가는 한때 초보자였다. - 헬렌 헤이스",
    "나약한 태도는 성격도 나약하게 만든다. - 아인슈타인",
    "가장 큰 위험은 위험 없는 삶을 사는 것이다. - 스티븐 코비",
    "행동은 모든 성공의 기본 열쇠다. - 파블로 피카소",
    "위대한 업적은 힘이 아니라 끈기로 이루어진다. - 사무엘 존슨",
    "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 믿는 대로 될 것이다. - 헨리 포드",
    "미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다. - 피터 드러커",
    "고통 없이는 얻는 것도 없다. - 벤자민 프랭클린",
    "오늘 걷지 않으면 내일 뛰어야 한다. - 카를레스 푸욜",
    "공부할 때의 고통은 잠깐이지만, 못 배운 고통은 평생이다. - 하버드 도서관",
    "가장 위대한 영광은 한 번도 실패하지 않음이 아니라, 실패할 때마다 다시 일어서는 데 있다.",
    "천재는 1%의 영감과 99%의 땀으로 이루어진다. - 토마스 에디슨",
    "늦었다고 생각할 때가 가장 빠를 때다.",
    "꿈을 꿀 수 있다면 이룰 수도 있다. - 월트 디즈니",
    "시작이 반이다. - 아리스토텔레스",
    "노력은 배신하지 않는다.",
    "피할 수 없으면 즐겨라. - 로버트 엘리엇",
    "실패는 성공의 어머니이다. - 에디슨",
    "독서가 정신에 미치는 영향은 운동이 육체에 미치는 영향과 같다. - 리처드 스틸"
];

function displayRandomQuote() {
    const quoteContainer = document.getElementById('quote-container');
    if (quoteContainer) {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        quoteContainer.textContent = randomQuote;
    }
}

function showLoading(message = "로딩 중...") {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `<div class="spinner"></div><p id="loader-msg">${message}</p>`;
        document.body.appendChild(loader);
    } else {
        const msgEl = document.getElementById('loader-msg');
        if (msgEl) msgEl.textContent = message;
    }
    loader.style.display = 'flex';
}

function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
}

function showFireworks() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = ''; // Clear previous

    // Simple CSS/JS Fireworks effect
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;

        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.backgroundColor = color;
        particle.style.animationDelay = Math.random() * 0.5 + 's';

        container.appendChild(particle);
    }

    setTimeout(() => {
        container.style.display = 'none';
    }, 3000);
}

// -------------------------------------------------------------------------
// Anti-Cheat Deterrents
// -------------------------------------------------------------------------

// 1. Disable Right Click
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    // alert("보안을 위해 우클릭이 제한됩니다."); // Optional: Alert user
});

// 2. Block Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
document.addEventListener('keydown', function (e) {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }

    // Ctrl + Shift + I / J / C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')) {
        e.preventDefault();
        return false;
    }

    // Ctrl + U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});

// 3. Debugger Trap (Freezes execution if DevTools is open)
setInterval(function () {
    debugger;
}, 100);

console.log("Security modules loaded.");

// -------------------------------------------------------------------------
// User Preferences (Dark Mode, Timer, Auto-Next)
// -------------------------------------------------------------------------

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    // Update button icon
    const btnIcon = document.getElementById('side-dark-icon');
    if (btnIcon) btnIcon.textContent = isDark ? '☀️' : '🌙';
}

// Load dark mode preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const btnIcon = document.getElementById('side-dark-icon');
        if (btnIcon) btnIcon.textContent = '☀️';
    }

    // Load timer and auto-next preferences
    const timerEnabled = localStorage.getItem('timerEnabled') === 'true';
    const autoNextEnabled = localStorage.getItem('autoNextEnabled') === 'true';

    const timerToggle = document.getElementById('timer-toggle');
    const autoNextToggle = document.getElementById('auto-next-toggle');

    if (timerToggle) timerToggle.checked = timerEnabled;
    if (autoNextToggle) autoNextToggle.checked = autoNextEnabled;
});

// Timer
let timerInterval = null;
let timerSeconds = 0;

function toggleTimer() {
    const isEnabled = document.getElementById('timer-toggle').checked;
    localStorage.setItem('timerEnabled', isEnabled);

    const timerDisplay = document.getElementById('quiz-timer');
    if (isEnabled) {
        timerDisplay.style.display = 'block';
        startTimer();
    } else {
        timerDisplay.style.display = 'none';
        stopTimer();
    }
}

function startTimer() {
    timerSeconds = 0;
    updateTimerDisplay();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('quiz-timer');
    if (timerDisplay) {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Auto-Next
function toggleAutoNext() {
    const isEnabled = document.getElementById('auto-next-toggle').checked;
    localStorage.setItem('autoNextEnabled', isEnabled);
}

// Hook into selectChoice to implement auto-next
const originalSelectChoice = window.selectChoice || selectChoice;
window.selectChoice = function (qIdx, cIdx) {
    // Call original function
    if (typeof originalSelectChoice === 'function') {
        originalSelectChoice(qIdx, cIdx);
    } else {
        currentQuestions[qIdx].userSelection = cIdx;
        renderQuizItems();
    }

    // Auto-next logic
    const autoNextEnabled = document.getElementById('auto-next-toggle')?.checked;
    if (autoNextEnabled) {
        const selectedQuestion = currentQuestions[qIdx];
        const selectedChoice = selectedQuestion.shuffledChoices[cIdx];

        // Check if answer is correct
        if (selectedChoice.originalIndex === selectedQuestion.correctOriginalIndex) {
            // Scroll to next question after 500ms
            setTimeout(() => {
                const nextIdx = qIdx + 1;
                if (nextIdx < currentQuestions.length) {
                    const nextQuestion = document.querySelectorAll('.question-item')[nextIdx];
                    if (nextQuestion) {
                        nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 500);
        }
    }
};


function initQuiz() {
    showScreen('quiz-screen');
    renderQuizItems();
    // Reset timer if needed
    const timerToggle = document.getElementById('timer-toggle');
    if (timerToggle && timerToggle.checked) {
        startTimer();
    }
}

// Add event listener for skip button
document.addEventListener('DOMContentLoaded', () => {
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            initQuiz();
        });
    }

    // 로그인 입력창에서 엔터키 누르면 로그인
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});

// ------------------------------
// 🔒 오답노트 탈출 방지
// ------------------------------
let isReviewMode = false;
let isReviewFinished = false;

// 🔥 오답노트 모드 시작 시 호출
window.enterReviewMode = function () {
    isReviewMode = true;
    isReviewFinished = false;
};

// 🔥 오답노트 완료 시 호출
window.finishReviewMode = function () {
    isReviewFinished = true;
    isReviewMode = false;
};

// 🔥 새로고침 / 뒤로가기 / 창닫기 방지
window.addEventListener("beforeunload", function (e) {
    if (isReviewMode && !isReviewFinished) {
        e.preventDefault();
        e.returnValue = "";
        return "";
    }
});

// Close modals when clicking outside
window.onclick = function (event) {
    const hintModal = document.getElementById('hint-modal');
    const messageModal = document.getElementById('message-modal');

    if (event.target === hintModal) {
        closeHintModal();
    }
    if (event.target === messageModal) {
        closeModal();
    }
}

// --- Q&A Feature (Robust) ---
const API_KEY = 'AIzaSyAhKsYJjjgUSfGvvMCEVQgYRbyxRTWn1jM';

function toggleQnaPanel(event) {
    const panel = document.getElementById('qna-panel');
    if (panel) {
        const isOpen = panel.classList.contains('open');
        if (isOpen) {
            panel.classList.remove('open');
        } else {
            panel.classList.add('open');
            // Stop propagation to prevent immediate close via document listener
            if (event) event.stopPropagation();
        }
    }
}

function closeQnaPanel() {
    const panel = document.getElementById('qna-panel');
    if (panel) {
        panel.classList.remove('open');
    }
}

async function askGemini() {
    const inputInput = document.getElementById('qna-input');
    const chatArea = document.getElementById('qna-chat-area');
    const userText = inputInput.value.trim();

    if (!userText) return;

    // Add User Message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'user-message';
    userMsgDiv.textContent = userText;
    chatArea.appendChild(userMsgDiv);
    inputInput.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;

    // Loading Indicator with Animation
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-message';
    loadingDiv.innerHTML = '답변 생성 중<span class="loading-dots"></span>';
    chatArea.appendChild(loadingDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `SYSTEM: You are a helpful AI tutor for 3D printing. Answer in Korean. Keep the answer plain text (no markdown formatting like ** or ##). Explanation should be suitable for a middle school student but DO NOT mention "middle school level" or "easy explanation" in your response. Keep the answer concise, under 250 characters. If the question is ambiguous or unclear, DO NOT GUESS. Instead, politely ask for clarification or more details.\nUSER: ${userText}`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }

        if (!data.candidates || data.candidates.length === 0) {
            // Handle safety block or empty response
            let msg = '답변을 생성할 수 없습니다.';
            if (data.promptFeedback) {
                msg += ` (사유: ${JSON.stringify(data.promptFeedback)})`;
            }
            throw new Error(msg);
        }

        const aiText = data.candidates[0].content.parts[0].text;
        loadingDiv.textContent = aiText;
    } catch (e) {
        console.error(e);
        // Show detailed error for debugging
        loadingDiv.textContent = `죄송합니다. 오류가 발생했습니다.\n(${e.message})`;
    }
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Close Q&A Context Logic (Safe)
document.addEventListener('click', function (e) {
    const panel = document.getElementById('qna-panel');
    const btn = document.getElementById('qna-btn');
    // Ensure panel exists and is open
    if (panel && panel.classList.contains('open')) {
        // If click target is outside panel AND outside the toggle button
        if (!panel.contains(e.target) && (!btn || !btn.contains(e.target))) {
            closeQnaPanel();
        }
    }
});
