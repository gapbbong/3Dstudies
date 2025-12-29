import re

file_path = r'd:\App\3d Studies\data.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Part 4 - restore the theoryContent structure
part4_theory = r'''1. 슬라이싱 (Slicing)
가. 정의: 3D 모델(STL)을 얇은 층(Layer)으로 분할 → G-code 생성
나. 슬라이서 프로그램: Cura, Simplify3D, Slic3r, 메이커봇 데스크톱 등

2. 출력 설정
가. 적층 높이 (Layer Height): 낮을수록 품질↑, 시간↑
나. 쉘 두께 (Shell Thickness): 외벽 두께
다. 채우기 (Infill): 내부 밀도 (0~100%)
라. 출력 속도 (Print Speed): 빠를수록 품질↓
마. 온도: 노즐 온도, 베드 온도 (재료별 상이)

3. 출력 보조물
가. 서포터 (Support): 돌출부 지지
- Overhang: 돌출부 지지
- Ceiling: 천장 지지
- Island: 고립된 부분 지지
나. 플랫폼 접착 보조
- Brim (브림): 바닥 테두리 확장
- Raft (래프트): 바닥 전체 받침대
- Skirt: 외곽선만 (테스트용)

4. G-code / M-code
가. G-code: 이동 및 동작 명령
- G0/G1: 이동 (G0=급속, G1=직선)
- G28: 원점 복귀 (Homing)
- G90: 절대 좌표, G91: 상대 좌표
- G92: 좌표계 설정
나. M-code: 기계 제어 명령
- M104: 노즐 온도 설정, M109: 노즐 온도 설정 후 대기
- M140: 베드 온도 설정, M190: 베드 온도 설정 후 대기
- M106: 쿨링팬 ON, M107: 쿨링팬 OFF
- M0: 정지, M1: 옵션 정지

5. 형상 설계 시 고려사항
가. 최소 치수: 구멍/축 지름 1mm 이상 권장, 벽 두께 1mm 이상
나. 공차: 조립 부품은 한쪽만 공차 적용
다. 서포터 필요 여부: 돌출 각도 45도 이상 시 필요
라. 출력 방향: 강도 및 표면 품질 고려'''

part5_theory = r'''1. 3D프린터 소재
가. FDM 소재
- PLA: 옥수수 전분 원료, 친환경, 수축 적음, 냄새 적음
- ABS: 석유 추출, 강도/내열성 우수, 수축 심함(히팅베드 필수), 유해 가스
- PVA: 물에 녹음(수용성), 서포터용
- TPU/PU: 고무처럼 탄성 있음
나. SLA/DLP 소재
- 광경화성 수지(Liquid Resin): UV 빛에 반응하여 굳음
- 보관: 빛 차단(검은 용기), 서늘한 곳
다. SLS 소재
- 분말(Powder): 나일론(Polyamide), 금속, 세라믹 등
- 특징: 서포터 불필요(분말이 지지), 표면 거칠음

2. 3D프린터 하드웨어
가. FDM
- 익스트루더(Extruder): 필라멘트 공급 (모터, 기어)
- 핫엔드(Hotend): 노즐 가열 및 압출
- 히팅베드(Heating Bed): 안착 및 수축 방지 (ABS 필수)
나. SLA/DLP
- 광원: 레이저(SLA) 또는 프로젝터(DLP)
- 수조(Vat): 레진 담는 통
- 플랫폼(Platform): 조형물이 붙는 판
- 방식: 자유 액면(위에서 조사), 규제 액면(아래에서 조사)
다. SLS
- 롤러/블레이드: 분말 평탄화 (Recoating)
- 챔버: 온도 유지 (예열)
- 레이저: 분말 소결'''

part6_theory = r'''1. 출력용 데이터 형식
가. STL (Stereolithography)
- 3차원 형상을 삼각형 메시(Mesh)로 표현
- 색상/질감 정보 없음
- 가장 널리 사용됨
나. OBJ
- 색상, 질감(Texture) 정보 포함 가능
- 3D 스캔 데이터 등에서 사용
다. AMF / 3MF
- 차세대 포맷, 색상/재료/압축 등 지원 (XML 기반)

2. 데이터 오류 및 수정
가. 주요 오류
- 비매니폴드(Non-manifold): 면이 닫히지 않거나, 선/점이 공유되지 않음
- 구멍(Hole): 메쉬가 터짐
- 반전된 면(Inverted Normal): 안팎이 뒤집힘
- 교차된 면(Self-intersection): 면끼리 뚫고 지나감
나. 오류 수정 (Netfabb, Meshmixer 등)
- 자동 수정: 간단한 구멍 메우기 등
- 수동 수정: 복잡한 오류, 형상 변경 필요 시
- *치명적 오류는 CAD에서 재설계 권장

3. 출력 준비 체크리스트
- 크기(Scale) 확인
- 공차(Tolerance) 확인
- 서포터(Support) 필요 여부 및 설정
- 채우기(Infill) 설정'''

part7_theory = r'''1. 출력 트러블 슈팅
가. 압출 불량
- 노즐 막힘: 온도 낮음, 이물질, 탄화
- 익스트루더 갈림: 리트랙션 과다, 속도 과다, 노즐 막힘
- 헛돔(Slip): 텐션 부족
나. 안착 불량
- 베드 레벨링 불량 (노즐 높이)
- 온도 부적절 (베드 식음)
- 안착 면적 부족 → 브림/래프트 사용
다. 품질 불량
- 갈라짐(Crack): 층간 결합력 부족 (온도 낮음, 냉각 과다)
- 휨(Warping): 수축 (ABS 등)
- 거미줄: 리트랙션 부족, 온도 과다

2. 출력물 회수 및 후처리
가. FDM
- 회수: 베드 식은 후 스크래퍼 사용 (무리한 힘 X)
- 후처리: 서포터 제거(니퍼), 사포질(Sanding), 도색, 훈증(ABS+아세톤)
나. SLA/DLP
- 회수: 장갑 착용(독성), 스크래퍼 사용
- 세척: IPA(이소프로필 알코올)로 미경화 레진 세척
- 경화: UV 경화기에서 2차 경화 (필수)
다. SLS
- 회수: 충분히 식은 후(Cooling) 파우더 제거
- 후처리: 샌드블라스팅(Bead blasting)으로 가루 제거'''

part8_theory = r'''1. 안전 보호구
가. 호흡 보호
- 방진 마스크: 분진(가루) 발생 시 (SLS, 후가공)
- 방독 마스크: 유해 가스 발생 시 (ABS 출력, 도색, 훈증)
- 송기 마스크: 산소 결핍 장소
나. 신체 보호
- 보안경: 레이저, 파편, 약품 튐 방지
- 보호 장갑: 니트릴(화학), 절연(전기), 내열(고온)
- 보호복: 피부 보호

2. 응급 처치 (심폐소생술 CPR)
- 순서: 의식 확인 → 119 신고 → 가슴 압박(30회) → 기도 확보 → 인공 호흡(2회) → 반복
- 압박 위치: 가슴 중앙(흉골 아래 1/2), 깊이 5cm, 분당 100~120회

3. 안전 점검 및 환경
가. 점검 종류
- 일상 점검: 매일 작업 전/중/후
- 정기 점검: 일정 기간마다
- 특별 점검: 기계 신설/변경/고장 수리 시
나. 환경 관리
- 환기: 국소 배기 장치, 전체 환기 (창문 개방)
- 소화기: A급(일반), B급(유류), C급(전기), D급(금속)'''

# Fix the corrupted structure
# Pattern: : `"id": "partX", ... "theoryContent":`
content = re.sub(
    r': `"id": "part4",\s*"title": "Part 4: 3D프린터 SW 설정",\s*"theoryContent":`,',
    f'"id": "part4",\n  "title": "Part 4: 3D프린터 SW 설정",\n  "theoryContent": `{part4_theory}`,',
    content
)

content = re.sub(
    r': `"id": "part5",\s*"title": "Part 5: 3D프린터 HW 설정",\s*"theoryContent":`,',
    f'"id": "part5",\n  "title": "Part 5: 3D프린터 HW 설정",\n  "theoryContent": `{part5_theory}`,',
    content
)

content = re.sub(
    r': `"id": "part6",\s*"title": "Part 6: 출력용 데이터 확정",\s*"theoryContent":`,',
    f'"id": "part6",\n  "title": "Part 6: 출력용 데이터 확정",\n  "theoryContent": `{part6_theory}`,',
    content
)

content = re.sub(
    r': `"id": "part7",\s*"title": "Part 7: 제품 출력",\s*"theoryContent":`,',
    f'"id": "part7",\n  "title": "Part 7: 제품 출력",\n  "theoryContent": `{part7_theory}`,',
    content
)

content = re.sub(
    r': `"id": "part8",\s*"title": "Part 8: 안전관리",\s*"theoryContent":`,',
    f'"id": "part8",\n  "title": "Part 8: 안전관리",\n  "theoryContent": `{part8_theory}`,',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Theory content restored successfully.")
