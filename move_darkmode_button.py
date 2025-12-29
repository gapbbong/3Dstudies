import re

# Read the HTML file
with open(r'd:\이갑종\App\3Dstudies\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Move dark mode button inside login screen
# First, remove the old button from header
old_button = r'        <button id="dark-mode-toggle" class="icon-btn" title="다크모드 전환" onclick="toggleDarkMode\(\)"\r?\n            style="position: absolute; top: 20px; left: 20px; pointer-events: auto;">🌙</button>'

content = re.sub(old_button, '', content)

# Add new button inside login screen
old_login_screen = r'(<div id="login-screen" class="screen active">)'
new_login_screen = r'''\1
            <button id="dark-mode-toggle-login" class="side-btn" onclick="toggleDarkMode()">
                <span class="btn-icon">🌙</span>
                <span class="btn-text">다크모드</span>
            </button>'''

content = re.sub(old_login_screen, new_login_screen, content)

# Write back
with open(r'd:\이갑종\App\3Dstudies\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML updated! Dark mode button moved to login screen.")
