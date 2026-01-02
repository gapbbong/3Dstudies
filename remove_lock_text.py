import re

# Read the JavaScript file
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the lock-overlay line to remove the text
old_line = "card.innerHTML += `<div class=\"lock-overlay\">🔒 잠김</div>`;"
new_line = 'card.innerHTML += `<div class="lock-overlay"></div>`;'

content = content.replace(old_line, new_line)

# Write back
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Use ASCII-only print to avoid encoding issues
print("Lock text removed successfully!")
