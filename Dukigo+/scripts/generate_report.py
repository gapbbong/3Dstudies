import json
from collections import defaultdict

with open(r'e:\3D studies\Dukigo+\broken_questions_audit.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

grouped = defaultdict(list)
for item in data:
    key = f"{item.get('year', 'N/A')}년 {item.get('round', 'N/A')}회"
    grouped[key].append(item)

report = "# ⚠️ Dukigo+ 기출문제 선택지 누락 검토 리포트\n\n"
report += f"총 **{len(data)}**개의 문항에서 선택지 누락(빈 문자열)이 발견되었습니다. 주된 원인은 이미지 포함 문항이거나 수학 공식 파싱 오류로 추정됩니다.\n\n"

for key in sorted(grouped.keys()):
    report += f"## 📅 {key}\n"
    report += "| 번호 | 내용 요약 | 누락된 선택지 상태 (Raw) | 라인 |\n"
    report += "| :--- | :--- | :--- | :--- |\n"
    for item in grouped[key]:
        no = item.get('no', '?')
        text = item.get('text', 'N/A')
        opts = item.get('options_raw', 'N/A')
        line = item.get('line', '?')
        report += f"| {no} | {text} | `{opts}` | {line} |\n"
    report += "\n"

with open(r'e:\3D studies\Dukigo+\broken_questions_report.md', 'w', encoding='utf-8') as out:
    out.write(report)
