import json

# Load extracted questions
with open('part2_questions.json', encoding='utf-8') as f:
    part2 = json.load(f)

with open('part3_questions.json', encoding='utf-8') as f:
    part3 = json.load(f)

# Convert to data.js format
def convert_to_datajs_format(questions, start_number=1):
    """Convert extracted questions to data.js format"""
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

part2_formatted = convert_to_datajs_format(part2, 1)
part3_formatted = convert_to_datajs_format(part3, 1)

# Create JavaScript code for Part 2 and Part 3
part2_js = {
    "id": "part2",
    "title": "Part 2: 엔지니어링 모델링",
    "theoryContent": """1. 3D 엔지니어링 소프트웨어
가. 기능별 템플릿
- Part Design: 단일 설계 파트 생성
- 어셈블리 디자인: 단일 파트와 어셈블리 결합
- 도면: 파트 또는 어셈블리의 설계 도면

나. 모델링 종류
(1) 와이어프레임 모델링: 선으로 물체의 윤곽 표현
(2) 서페이스 모델링: 기하곡면 처리, 표면 데이터만 존재
(3) 솔리드 모델링: 질량, 체적, 부피 등 물리적 성질 포함
(4) 폴리곤 모델링: 평면 다각형을 붙여 형상 제작

2. 형상 입체화 피처 명령
가. 돌출(Extrude): 프로파일에 깊이 추가
나. 회전(Revolve): 축 기준으로 회전
다. 스윕(Sweep): 경로를 따라 형상 작성
라. 로프트(Loft): 여러 프로파일 혼합
마. 코일(Coil): 나선형 스프링 작성
바. 엠보싱(Embossing): 볼록/오목한 피쳐 작성
사. 리브(Rib): 지지대 작성
아. 구멍(Hole): 규격 구멍 작성
자. 셸(Shell): 동일 두께 통 작성

3. 조립품 구성
가. 상향식(Bottom-up): 파트를 모델링 후 조립
나. 하향식(Top-down): 조립도에서 부품 조립하며 모델링

4. 제약 조건
가. 일치: 면/선/축을 일치시킴
나. 접촉: 면/선을 접촉하도록 함
다. 오프셋: 면/선 사이 거리 설정
라. 고정 컴포넌트: 파트 고정""",
    "questions": part2_formatted
}

part3_js = {
    "id": "part3",
    "title": "Part 3: 3D프린터 SW 설정",
    "theoryContent": """1. 슬라이서 소프트웨어
가. 슬라이싱 개념
- 3D 모델을 층(Layer) 단위로 분할
- G-code 생성: 프린터가 이해하는 명령어

나. 주요 설정 항목
(1) 적층 높이(Layer Height)
- 값이 작을수록: 정밀도 ↑, 시간 ↑
- 값이 클수록: 속도 ↑, 표면 거칠음

(2) 벽 두께(Wall Thickness)
- 노즐 구경의 배수로 설정
- 0.4mm 노즐 → 0.8mm, 1.2mm 등

(3) 내부 채움(Infill)
- 밀도(%): 강도와 무게 결정
- 패턴: Grid, Honeycomb 등

2. 서포트 설정
가. 서포터 필요 조건
- 오버행 각도 45도 초과 시 필요
- 공중에 떠있는 부분

나. 서포트 제거
- 출력 후 수작업 제거
- 제거 용이성 고려하여 설계

3. 출력 문제 해결
가. 수축/갈라짐
- ABS: 수축률 높음 → 히팅베드 사용
- PLA: 수축률 낮음

나. 흐름 현상
- 노즐 온도 너무 높음
- 분사량 과다

다. 층 분리
- 노즐 온도 낮음
- 분사량 부족
- 이동 속도 과다""",
    "questions": part3_formatted
}

# Save as JSON for inspection
with open('part2_datajs.json', 'w', encoding='utf-8') as f:
    json.dump(part2_js, f, ensure_ascii=False, indent=2)

with open('part3_datajs.json', 'w', encoding='utf-8') as f:
    json.dump(part3_js, f, ensure_ascii=False, indent=2)

print(f"Part 2: {len(part2_formatted)} questions formatted")
print(f"Part 3: {len(part3_formatted)} questions formatted")
print("\nSaved to part2_datajs.json and part3_datajs.json")
print("\nNext: Add these to data.js manually or via script")
