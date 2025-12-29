import re

# Read the HTML file
with open(r'd:\이갑종\App\3Dstudies\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace "기초 학습" with the new text
old_text = r'<h2>기초 학습</h2>'
new_text = '<h2><strong>1단계: 기초 학습 (이론 + 기초 문제)</strong></h2>'

content = content.replace(old_text, new_text)

# Write back
with open(r'd:\이갑종\App\3Dstudies\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML 수정 완료! '1단계: 기초 학습 (이론 + 기초 문제)'로 변경되었습니다.")
