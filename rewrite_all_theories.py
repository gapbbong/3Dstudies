import re

# Read the file
with open('d:/App/3d Studies/data_practice.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define clean theories for each chapter (avoiding Stage 1 duplication)
theories = {
    "practice_part9b": """데이터 클리닝
- 노이즈 발생 원인: 측정 환경, 대상물 표면 상태, 스캐닝 설정
- 노이즈 제거: 자동 필터링 기능 사용 또는 수동 제거

이동식 vs 고정식 스캐너
- 이동식: 대형 물체, 스캐너 설치 어려운 경우 사용 (정밀도는 고정식보다 낮음)
- 고정식: 정밀 측정이 필요한 경우

메시 종류
- 클로즈 메시: 삼각형 면의 한 모서리가 2개의 면과 공유
- 오픈 메시: 메시 사이에 한 면이 비어 있는 형상

스캐닝 설정 단계
- 스캐너 보정, 노출 설정, 측정 범위 설정, 측정 위치 선정, 스캐닝 간격 설정, 속도 설정""",

    "practice_part10": """넙스(NURBS) 모델링 (1단계 보충)
- 렌더링 시 하이 폴리곤으로 전환되어 많은 계산 필요, 데이터가 무거워짐

서피스 모델링
- 곡면 모델링, 면을 중심으로 물체 표현
- 표면만 존재하는 모델링 기법
- 컴퓨터 속도와 메모리를 적게 사용

오류 수정 프로세스
- 치명적 오류 없음: 자동 오류 수정
- 자동 수정 후 남은 오류: 수동 오류 수정
- 치명적 오류 있음: 모델링 소프트웨어로 수정""",

    "practice_part11a1": """(제도 일반 - 1단계 Part 3에서 이미 다룸)
이 챕터는 1단계와 중복되므로 핵심만 간단히 정리

치수 공차 추가 사항
- 참고 치수: ( ) 괄호로 표시
- 이론적으로 정확한 치수: □ 사각 테두리로 표시""",

    "practice_part11a2": """(제도 응용 - 1단계 Part 3 심화)
기하공차 추가
- 평면도: ▱
- 평행도: //
- 직각도: ⊥
- 위치도: ⊕
- 원통도: /○/

구속조건
- 일치, 접촉, 오프셋, 동심, 직각, 접선 등""",

    "practice_part11b": """슬라이싱 (1단계 Part 4에서 이미 다룸)
추가 심화 내용

G-code 추가
- G20: 인치 단위
- G21: 밀리미터 단위
- G28: 원점 복귀

M-code 추가
- M104: 노즐 온도 설정
- M140: 베드 온도 설정
- M106: 쿨링팬 ON
- M107: 쿨링팬 OFF""",

    "practice_part12": """출력 관련 추가 사항

Retraction (역회전)
- 노즐 이동 시 필라멘트를 뒤로 빼서 String(거미줄) 현상 방지

출력 문제 해결
- 노즐-플랫폼 거리 너무 가까움: 노즐 막힘, 압출 어려움
- 노즐-플랫폼 거리 너무 멀음: 재료 흘러내림

형상 분석
- 회전(Rotate), 확대/축소(Scale), 이동(Move)
- 지지대 최소화를 위한 최적 자세 배치""",

    "practice_part13": """후가공

퍼티 종류
- 1액형: 경화제 없음, 경화 속도 느림, 미세한 틈새 메움
- 에폭시: 강한 강도, 콘크리트 균열 보수
- 폴리에스터: 목재 가공, 자동차 보수
- 우레탄: 탄성력 우수, 방수 공사"""
}

# Escape and replace each theory
for chapter_id, theory_text in theories.items():
    # Escape for JavaScript
    escaped = theory_text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    
    # Pattern to match this chapter's theoryContent
    pattern = rf'("id":\s*"{chapter_id}"[^}}]*"theoryContent":\s*)"[^"]*(?:\\.[^"]*)*"'
    
    def replace_theory(match):
        return f'{match.group(1)}"{escaped}"'
    
    content = re.sub(pattern, replace_theory, content, count=1)

# Write back
with open('d:/App/3d Studies/data_practice.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 모든 챕터 핵심 이론 작성 완료!")
print("✅ Part 9B ~ Part 13 (7개 챕터)")
print("✅ 1단계 중복 제거, 심화 내용만 포함")
print("✅ 브라우저 새로고침 후 확인하세요!")
