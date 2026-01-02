import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

# New theory for Part 9A (avoiding Stage 1 duplication)
new_theory = """스캐너 방식별 특징 비교
- 측정 거리 순서: TOF 방식 > 변조광 방식 > 삼각측량 방식
- 측정 속도: 백색광 방식이 가장 빠름
- 레이저 기반 삼각측량: 한 변과 2개의 각으로부터 나머지 변의 길이 계산
- 패턴 이미지 기반 삼각측량: 광 패턴을 바꾸면서 초점심도 조절, 넓은 영역 빠르게 측정 (휴대용 개발은 레이저 기반이 더 유리)

스캐닝 준비 단계
- 스캐닝 방식, 측정 대상물의 크기 및 표면 처리, 스캐너 선정 등 포함
- 산업용: 매우 높은 정밀도 요구, 표면 코팅으로 난반사 제거
- 일반용: 낮은 수준의 정밀도로도 가능, 난반사 코팅 불필요

스캐닝 방식 선택
- 표면 코팅 불가 시: 접촉식 측정 사용
- 쉽게 변형되는 대상물: 비접촉식 (TOF 등) 사용

정합용 마커
- 측정대상물이 클 경우 여러 번 나누어 스캔 시 사용
- 3개 이상의 볼을 미리 고정시켜 같이 스캔"""

# Escape for JavaScript string
new_theory_escaped = new_theory.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

# Find Part 9A and replace its theoryContent
pattern = r'("id":\s*"practice_part9a"[^}]*"theoryContent":\s*)"[^"]*(?:\\.[^"]*)*"'

def replace_part9a(match):
    prefix = match.group(1)
    return f'{prefix}"{new_theory_escaped}"'

new_content = re.sub(pattern, replace_part9a, content, count=1)

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Part 9A 핵심 이론 재작성 완료!")
print("✅ 1단계 중복 내용 제거")
print("✅ 심화 내용만 포함")
print("✅ 브라우저 새로고침 후 확인하세요!")
