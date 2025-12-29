import re

# Read the JavaScript file
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the DOMContentLoaded event listener and add Enter key support
old_dom_content = r"(// Add event listener for skip button\r?\ndocument\.addEventListener\('DOMContentLoaded', \(\) => \{\r?\n    const skipBtn = document\.getElementById\('skip-btn'\);\r?\n    if \(skipBtn\) \{\r?\n        skipBtn\.addEventListener\('click', \(\) => \{\r?\n            initQuiz\(\);\r?\n        \}\);\r?\n    \}\r?\n\}\);)"

new_dom_content = r"""// Add event listener for skip button
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
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});"""

# Replace
content = re.sub(old_dom_content, new_dom_content, content, flags=re.MULTILINE)

# Write back
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("JavaScript 수정 완료!")
