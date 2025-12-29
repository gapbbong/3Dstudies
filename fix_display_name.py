import re

# Read the JavaScript file
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace updateDisplayName function
old_function = r'''// Update display name with current part info\r?\nfunction updateDisplayName\(\) \{\r?\n    const info = document\.getElementById\('display-name'\);\r?\n    if \(info && currentUser\) \{\r?\n        const partInfo = currentChapterId \? `\[.*?\] ` : '';\r?\n        info\.textContent = partInfo \+ currentUser;\r?\n    \}\r?\n\}'''

new_function = '''// Update display name with current part info
function updateDisplayName() {
    const nameEl = document.getElementById('display-name');
    if (nameEl && currentUser) {
        nameEl.textContent = currentUser;
    }
}'''

# Replace
content = re.sub(old_function, new_function, content, flags=re.MULTILINE)

# Write back
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("JavaScript 수정 완료! 이제 학번+이름이 온도 앞에 표시됩니다.")
