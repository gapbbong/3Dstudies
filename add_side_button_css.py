import re

# Read the CSS file
with open(r'd:\이갑종\App\3Dstudies\css\style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Add side button styles at the end of the file
side_button_css = '''

/* Side Button for Dark Mode on Login Screen */
.side-btn {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 15px 10px;
    border-radius: 10px 0 0 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s;
    z-index: 1000;
    writing-mode: horizontal-tb;
}

.side-btn:hover {
    padding-right: 15px;
    background: var(--accent-color);
}

.side-btn .btn-icon {
    font-size: 1.5em;
}

.side-btn .btn-text {
    font-size: 0.8em;
    font-weight: 500;
    white-space: nowrap;
}

body.dark-mode .side-btn {
    background: var(--accent-color);
}

body.dark-mode .side-btn:hover {
    background: var(--primary-color);
}
'''

content += side_button_css

# Write back
with open(r'd:\이갑종\App\3Dstudies\css\style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS updated! Side button styles added.")
