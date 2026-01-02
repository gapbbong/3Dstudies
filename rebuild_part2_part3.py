import json

# Reload all parts with corrected data
parts_to_rebuild = {}

# Part 0-1 (unchanged, from existing data.js)
# Part 2-3 (corrected)
with open('part2_questions_clean.json', 'r', encoding='utf-8') as f:
    parts_to_rebuild[2] = json.load(f)

with open('part3_questions_clean.json', 'r', encoding='utf-8') as f:
    parts_to_rebuild[3] = json.load(f)

# Part 5-8 (unchanged)
for part_num in [5, 6, 7, 8]:
    with open(f'part{part_num}_questions_clean.json', 'r', encoding='utf-8') as f:
        parts_to_rebuild[part_num] = json.load(f)

# Convert to data.js format
def convert_to_datajs_format(questions, start_number=1):
    converted = []
    for i, q in enumerate(questions):
        converted.append({
            "number": f"{start_number + i:02d}",
            "question": q['question'],
            "choices": q['choices'],
            "answer": q['answer'],
            "explanation": q['explanation'] if q['explanation'] else "",
            "image": None
        })
    return converted

# Update Part 2 and Part 3 datajs files
part2_config = {
    "id": "part2",
    "title": "Part 2: 엔지니어링 모델링",
    "theoryContent": """1. 3D 엔지니어링 소프트웨어
가. 기능별 템플릿
- Part Design: 단일 설계 파트 생성
- 어셈블리 디자인: 파트와 어셈블리 결합
- 도면: 설계 도면 작성

나. 모델링 종류
(1) 와이어프레임: 선으로 윤곽 표현
(2) 서페이스: 표면 데이터만 존재
(3) 솔리드: 질량, 체적, 부피 포함
(4) 폴리곤: 평면 다각형 조합

2. 형상 입체화 피처
가. 돌출(Extrude): 깊이 추가
나. 회전(Revolve): 축 기준 회전
다. 스윕(Sweep): 경로 따라 형상 작성
라. 로프트(Loft): 프로파일 혼합
마. 코일(Coil): 나선형 스프링
바. 셸(Shell): 동일 두께 통 작성

3. 조립품 구성
가. 상향식(Bottom-up): 파트 모델링 후 조립
나. 하향식(Top-down): 조립하며 모델링

4. 제약 조건
가. 일치: 면/선/축 일치
나. 접촉: 면/선 접촉
다. 오프셋: 거리 설정
라. 고정: 파트 고정

5. 출력 공차
가. 조립 부품 공차 적용
나. FDM 방식 열 수축 고려""",
    "questions": convert_to_datajs_format(parts_to_rebuild[2], 1)
}

part3_config = {
    "id": "part3",
    "title": "Part 3: 3D프린터 SW 설정",
    "theoryContent": """1. 슬라이서 소프트웨어
가. 슬라이싱 개념
- 3D 모델을 층(Layer) 단위로 분할
- G-code 생성

나. 주요 설정
(1) 적층 높이(Layer Height)
- 작을수록: 정밀도↑, 시간↑
- 클수록: 속도↑, 표면 거칠음

(2) 벽 두께(Wall Thickness)
- 노즐 구경의 배수로 설정

(3) 내부 채움(Infill)
- 밀도(%): 강도와 무게 결정
- 패턴: Grid, Honeycomb 등

2. 서포트 설정
가. 필요 조건
- 오버행 각도 45도 초과
- 공중에 떠있는 부분

나. 서포트 제거
- 출력 후 수작업 제거

3. 출력 문제 해결
가. 수축/갈라짐
- ABS: 수축률 높음 → 히팅베드 사용
- PLA: 수축률 낮음

나. 흐름 현상
- 노즐 온도 과다
- 분사량 과다

다. 층 분리
- 노즐 온도 부족
- 이동 속도 과다""",
    "questions": convert_to_datajs_format(parts_to_rebuild[3], 1)
}

# Save updated configs
with open('part2_datajs_clean.json', 'w', encoding='utf-8') as f:
    json.dump(part2_config, f, ensure_ascii=False, indent=2)

with open('part3_datajs_clean.json', 'w', encoding='utf-8') as f:
    json.dump(part3_config, f, ensure_ascii=False, indent=2)

print("="*70)
print("Updated Part 2 and Part 3 configurations")
print("="*70)
print(f"Part 2: {len(part2_config['questions'])} questions")
print(f"Part 3: {len(part3_config['questions'])} questions")
print("\nNow rebuilding complete data.js...")
