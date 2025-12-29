import json

# Read JSON
with open('quiz.json', 'r', encoding='utf-8') as f:
    quiz_data = json.load(f)

json_str = json.dumps(quiz_data, ensure_ascii=False, indent=2)

html_content = f"""<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 프린터 운용 기능사 문제풀이</title>
    <style>
        body {{
            font-family: 'Malgun Gothic', sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }}

        .container {{
            width: 100%;
            max-width: 800px;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }}

        h1 {{
            text-align: center;
            color: #333;
        }}

        .question-card {{
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fff;
        }}

        .question-text {{
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #2c3e50;
        }}

        .question-image {{
            max-width: 100%;
            height: auto;
            margin-bottom: 15px;
            border-radius: 5px;
            display: block;
        }}

        .choices {{
            list-style: none;
            padding: 0;
        }}

        .choice-item {{
            margin: 10px 0;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
        }}

        .choice-item:hover {{
            background-color: #eef2f7;
        }}

        .choice-item.selected {{
            background-color: #d1e7dd;
            border-color: #badbcc;
        }}

        .choice-item.correct {{
            background-color: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }}

        .choice-item.incorrect {{
            background-color: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }}

        .controls {{
            margin-top: 15px;
            display: flex;
            gap: 10px;
        }}

        button {{
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }}

        .btn-check {{
            background-color: #007bff;
            color: white;
        }}

        .btn-check:hover {{
            background-color: #0056b3;
        }}

        .explanation {{
            margin-top: 15px;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 5px;
            color: #856404;
            display: none;
        }}

        .score-board {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            font-weight: bold;
        }}
    </style>
</head>

<body>

    <div class="score-board">
        맞은 개수: <span id="score">0</span> / <span id="total">0</span>
    </div>

    <div class="container">
        <h1>3D 프린터 운용 기능사 필기</h1>
        <div id="quiz-container">
            <!-- Questions will be loaded here -->
        </div>
    </div>

    <script>
        const rawQuestions = {json_str};
        
        // Filter out noise
        let questions = rawQuestions.filter(q => 
            q.choices.length > 0 || q.answer || q.explanation
        );
        let score = 0;

        function shuffleArray(array) {{
            for (let i = array.length - 1; i > 0; i--) {{
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }}
            return array;
        }}

        function prepareQuestions() {{
            questions.forEach(q => {{
                // 1. Identify correct original index
                const answerText = q.answer || "";
                let correctOriginalIndex = -1;
                if (answerText.includes("1") || answerText.includes("①")) correctOriginalIndex = 0;
                else if (answerText.includes("2") || answerText.includes("②")) correctOriginalIndex = 1;
                else if (answerText.includes("3") || answerText.includes("③")) correctOriginalIndex = 2;
                else if (answerText.includes("4") || answerText.includes("④")) correctOriginalIndex = 3;
                
                q.correctOriginalIndex = correctOriginalIndex;

                // 2. Create choice objects with clean text and original index
                q.shuffledChoices = q.choices.map((choice, index) => {{
                    // Remove "① ", "② ", etc. from the start
                    let cleanText = choice.replace(/^[①②③④❶❷❸❹❺\(\d+\)\d+\)]\s*/, '');
                    return {{
                        text: cleanText,
                        originalIndex: index
                    }};
                }});

                // 3. Shuffle
                shuffleArray(q.shuffledChoices);
            }});
        }}

        function renderQuiz() {{
            const container = document.getElementById('quiz-container');
            container.innerHTML = '';

            questions.forEach((q, index) => {{
                const card = document.createElement('div');
                card.className = 'question-card';

                // Image
                let imgHtml = '';
                if (q.image) {{
                    imgHtml = `<img src="${{q.image}}" class="question-image" alt="문제 이미지">`;
                }}

                // Choices
                let choicesHtml = '';
                const labels = ['①', '②', '③', '④', '⑤'];
                q.shuffledChoices.forEach((choiceObj, cIndex) => {{
                    const label = labels[cIndex] || (cIndex + 1) + '.';
                    choicesHtml += `<li class="choice-item" onclick="selectChoice(${{index}}, ${{cIndex}}, this)">${{label}} ${{choiceObj.text}}</li>`;
                }});

                // Calculate correct label for explanation
                let correctLabel = q.answer || '정보 없음';
                const correctChoiceIndex = q.shuffledChoices.findIndex(c => c.originalIndex === q.correctOriginalIndex);
                if (correctChoiceIndex !== -1) {{
                    correctLabel = labels[correctChoiceIndex];
                }}

                card.innerHTML = `
                <div class="question-text">${{index + 1}}. ${{q.question}}</div>
                ${{imgHtml}}
                <ul class="choices" id="choices-${{index}}">
                    ${{choicesHtml}}
                </ul>
                <div class="controls">
                    <button class="btn-check" onclick="checkAnswer(${{index}})">정답 확인</button>
                </div>
                <div class="explanation" id="explanation-${{index}}">
                    <strong>정답:</strong> ${{correctLabel}}<br>
                    <strong>해설:</strong> ${{q.explanation || '해설이 없습니다.'}}
                </div>
            `;
                container.appendChild(card);
            }});
        }}

        window.selectChoice = function (qIndex, cIndex, element) {{
            const parent = document.getElementById(`choices-${{qIndex}}`);
            // Remove selected class from siblings
            Array.from(parent.children).forEach(child => child.classList.remove('selected'));
            // Add to clicked
            element.classList.add('selected');
        }};

        window.checkAnswer = function (qIndex) {{
            const q = questions[qIndex];
            const explanationEl = document.getElementById(`explanation-${{qIndex}}`);
            const parent = document.getElementById(`choices-${{qIndex}}`);
            const selected = parent.querySelector('.selected');

            if (!selected) {{
                alert("답을 선택해주세요.");
                return;
            }}

            // Reveal explanation
            explanationEl.style.display = 'block';

            const selectedIndex = Array.from(parent.children).indexOf(selected);
            const selectedChoiceObj = q.shuffledChoices[selectedIndex];

            if (selectedChoiceObj.originalIndex === q.correctOriginalIndex) {{
                selected.classList.add('correct');
                if (!q.checked) {{
                    score++;
                    document.getElementById('score').textContent = score;
                    q.checked = true;
                }}
            }} else {{
                selected.classList.add('incorrect');
                // Find and highlight the correct answer
                q.shuffledChoices.forEach((choiceObj, idx) => {{
                    if (choiceObj.originalIndex === q.correctOriginalIndex) {{
                        if (parent.children[idx]) {{
                            parent.children[idx].classList.add('correct');
                        }}
                    }}
                }});
            }}

            // Disable further clicks
            Array.from(parent.children).forEach(child => {{
                child.onclick = null;
                child.style.cursor = 'default';
            }});
        }};

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {{
            // Shuffle questions
            shuffleArray(questions);
            
            prepareQuestions();
            document.getElementById('total').textContent = questions.length;
            renderQuiz();
        }});
    </script>

</body>

</html>
"""

with open('quiz.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
    print("Successfully generated quiz.html")
