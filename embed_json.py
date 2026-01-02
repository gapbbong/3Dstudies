import json
import re

# Read JSON
with open('quiz.json', 'r', encoding='utf-8') as f:
    quiz_data = json.load(f)

# Read HTML
with open('quiz.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Prepare new script content
json_str = json.dumps(quiz_data, ensure_ascii=False, indent=2)

# Logic:
# 1. Replace the initialization and loadQuiz function with the JSON data and new initialization.
#    Original structure:
#    let questions = [];
#    let score = 0;
#    async function loadQuiz() { ... }
#    function renderQuiz() { ... }
#
#    We want to replace everything from 'let questions' up to (but not including) 'function renderQuiz'.

pattern = r'let questions = \[\];[\s\S]*?async function loadQuiz\(\)[\s\S]*?\}[\s\S]*?(?=function renderQuiz)'

new_block = f"""
    const rawQuestions = {json_str};
    
    // Filter out noise
    let questions = rawQuestions.filter(q => q.choices.length > 0 || q.answer || q.explanation);
    let score = 0;

"""

# Perform replacement
if re.search(pattern, html_content):
    html_content = re.sub(pattern, new_block, html_content)
    print("Replaced initialization and loadQuiz function.")
else:
    print("Could not find pattern to replace initialization and loadQuiz.")

# 2. Replace the final call 'loadQuiz();' with 'renderQuiz();' and total count update.
#    We need to make sure the DOM is ready, but the script is at the end of body, so it should be fine.
#    We'll add the total count update here.

final_call_replacement = """
    document.getElementById('total').textContent = questions.length;
    renderQuiz();
"""

html_content = html_content.replace('loadQuiz();', final_call_replacement)

with open('quiz.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
    print("Saved updated quiz.html")
