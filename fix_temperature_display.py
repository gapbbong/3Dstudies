import re

# Read the JavaScript file
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace updateTemperatureDisplay function to include name
old_function = r'''function updateTemperatureDisplay\(\) \{\r?\n    const tempEl = document\.getElementById\('user-temperature'\);\r?\n    if \(tempEl\) \{\r?\n        const temp = appData\.userData\.temperature;\r?\n        const rank = getRankInfo\(temp\);\r?\n\r?\n        // Display: 12\.5° 🧊 초보자\r?\n        tempEl\.innerHTML = `<span style="font-weight:bold">\$\{temp\}°</span> <span style="font-size:0\.9em">\$\{rank\.icon\} \$\{rank\.title\}</span>`;\r?\n        tempEl\.style\.color = rank\.color;\r?\n    \}\r?\n\}'''

new_function = '''function updateTemperatureDisplay() {
    const tempEl = document.getElementById('user-temperature');
    if (tempEl) {
        const temp = appData.userData.temperature;
        const rank = getRankInfo(temp);

        // Display: 2701홍길동 12.5° 🧊 초보자
        const nameDisplay = currentUser ? `${currentUser} ` : '';
        tempEl.innerHTML = `${nameDisplay}<span style="font-weight:bold">${temp}°</span> <span style="font-size:0.9em">${rank.icon} ${rank.title}</span>`;
        tempEl.style.color = rank.color;
    }
}'''

# Replace
content = re.sub(old_function, new_function, content, flags=re.MULTILINE)

# Write back
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("수정 완료! 이제 온도 앞에 학번+이름이 표시됩니다.")
