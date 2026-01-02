import re

# Read the CSS file
with open(r'd:\이갑종\App\3Dstudies\css\style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old h1 style
old_h1 = r'#login-screen h1 \{[^}]+\}'
new_h1 = '''/* 타이틀을 작고 연하게 */
#login-screen h1 {
    margin-top: 30px;
    font-style: italic;
    color: #7f8c8d;
    font-size: 1.1em;
    font-weight: 400;
    line-height: 1.6;
}'''

# Define the old quote style
old_quote = r'#quote-container \{[^}]+\}'
new_quote = '''/* 명언을 크고 굵게 */
#quote-container {
    font-size: 2em;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 30px;
    line-height: 1.3;
    word-break: keep-all;
}'''

# Replace
content = re.sub(old_h1, new_h1, content, flags=re.DOTALL)
content = re.sub(old_quote, new_quote, content, flags=re.DOTALL)

# Write back
with open(r'd:\이갑종\App\3Dstudies\css\style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS 수정 완료!")
