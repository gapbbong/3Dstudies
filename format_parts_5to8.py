import json

# Load cleaned questions for Part 5-8
parts_data = {}
for part_num in [5, 6, 7, 8]:
    with open(f'part{part_num}_questions_clean.json', 'r', encoding='utf-8') as f:
        parts_data[part_num] = json.load(f)

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

# Create data structures with theory content
parts_config = {
    5: {
        "id": "part5",
        "title": "Part 5: 3D프린터 HW 설정",
        "theoryContent": """1. 3D프린터 하드웨어 구성
가. FDM 프린터 주요 부품
(1) 익스트루더(Extruder)
- 필라멘트를 녹여 압출
- 핫엔드: 노즐, 히터블록, 히트싱크
- 콜드엔드: 필라멘트 공급 기어

(2) 히팅베드(Heating Bed)
- 출력물 안착 및 수축 방지
- ABS: 80-110°C
- PLA: 50-60°C

(3) 모터 시스템
- 스테퍼 모터: 정밀 제어
- X, Y, Z축 이동

2. 프린터 캘리브레이션
가. 베드 레벨링
- 노즐과 베드 간격 조정
- 종이 한 장 두께 (0.1mm)

나. 노즐 높이 조정
- Z-offset 설정
- 첫 레이어 품질 결정

다. 압출량 조정
- E-step 캘리브레이션
- 필라멘트 직경 측정

3. 온도 설정
가. 노즐 온도
- PLA: 190-220°C
- ABS: 230-260°C
- PETG: 220-250°C

나. 베드 온도
- 재료별 최적 온도 설정
- 수축 방지""",
        "questions": convert_to_datajs_format(parts_data[5], 1)
    },
    6: {
        "id": "part6",
        "title": "Part 6: 출력용 데이터 확정",
        "theoryContent": """1. 슬라이싱 최종 설정
가. 출력 품질 설정
(1) 레이어 높이
- 0.1mm: 고품질
- 0.2mm: 표준
- 0.3mm: 고속

(2) 벽 두께
- 최소 2개 레이어
- 노즐 직경의 배수

나. 서포트 최적화
- 오버행 각도 설정
- 서포트 밀도 조정
- 제거 용이성 고려

2. G-code 생성 및 검증
가. G-code 확인
- 시작/종료 코드 확인
- 온도 설정 확인
- 이동 경로 시뮬레이션

나. 파일 전송
- SD카드
- USB 케이블
- Wi-Fi (지원 시)

3. 출력 시간 및 재료 예측
가. 출력 시간 계산
- 슬라이서 예상 시간
- 실제 시간과 차이 고려

나. 필라멘트 사용량
- 무게(g) 확인
- 길이(m) 확인""",
        "questions": convert_to_datajs_format(parts_data[6], 1)
    },
    7: {
        "id": "part7",
        "title": "Part 7: 제품 출력",
        "theoryContent": """1. 출력 준비
가. 프린터 점검
- 베드 청소
- 노즐 막힘 확인
- 필라멘트 장착

나. 첫 레이어 확인
- 안착 상태 점검
- 즉시 중단 판단

2. 출력 중 모니터링
가. 확인 사항
- 레이어 적층 상태
- 서포트 생성 상태
- 필라멘트 공급 상태

나. 문제 발생 시 대응
- 즉시 중단
- 원인 파악
- 재출력 준비

3. 후처리
가. 서포트 제거
- 니퍼, 펜치 사용
- 표면 손상 주의

나. 표면 마감
- 샌딩(연마)
- 아세톤 증기 처리(ABS)
- 프라이머 도장

다. 조립
- 접착제 사용
- 볼트/너트 체결""",
        "questions": convert_to_datajs_format(parts_data[7], 1)
    },
    8: {
        "id": "part8",
        "title": "Part 8: 3D프린터 안전관리",
        "theoryContent": """1. 안전 수칙
가. 화재 예방
- 프린터 주변 가연물 제거
- 무인 출력 금지
- 화재 감지기 설치

나. 화상 예방
- 노즐, 베드 고온 주의
- 냉각 후 접촉
- 보호 장갑 착용

다. 환기
- 밀폐 공간 사용 금지
- 환기 시설 가동
- 유해 가스 배출

2. 유지보수
가. 정기 점검
- 벨트 장력 확인
- 나사 조임 확인
- 배선 상태 확인

나. 청소
- 노즐 청소
- 베드 청소
- 먼지 제거

다. 부품 교체
- 노즐 교체 주기
- 벨트 교체 시기
- 베어링 윤활

3. 전기 안전
가. 접지
- 3핀 플러그 사용
- 접지 확인

나. 과부하 방지
- 적정 용량 콘센트
- 멀티탭 사용 주의""",
        "questions": convert_to_datajs_format(parts_data[8], 1)
    }
}

# Save each part
for part_num, part_data in parts_config.items():
    with open(f'part{part_num}_datajs_clean.json', 'w', encoding='utf-8') as f:
        json.dump(part_data, f, ensure_ascii=False, indent=2)

print("="*70)
print("Data.js format created for Part 5-8!")
print("="*70)
for part_num in [5, 6, 7, 8]:
    print(f"Part {part_num}: {len(parts_config[part_num]['questions'])} questions")
print(f"Total: {sum(len(parts_config[p]['questions']) for p in [5,6,7,8])} questions")
print("\nReady to integrate into data.js!")
