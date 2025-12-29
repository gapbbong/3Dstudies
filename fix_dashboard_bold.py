import re

# Read the CSS file
with open(r'd:\이갑종\App\3Dstudies\css\style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace .dashboard-section h2 style
old_style = r'''\.dashboard-section h2 \{\r?\n    font-weight: 300;\r?\n    border-bottom: 1px solid #eee;\r?\n    padding-bottom: 15px;\r?\n    margin-bottom: 30px;\r?\n    color: #7f8c8d;\r?\n    font-size: 1\.5em;\r?\n\}'''

new_style = '''.dashboard-section h2 {
    font-weight: 900;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 30px;
    color: #000000;
    font-size: 1.5em;
}'''

# Replace
content = re.sub(old_style, new_style, content, flags=re.MULTILINE)

# Write back
with open(r'd:\이갑종\App\3Dstudies\css\style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS 수정 완료! 대시보드 제목이 더 굵고 검정색으로 진하게 표시됩니다.")
