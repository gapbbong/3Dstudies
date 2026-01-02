import json
import re

file_path = "D:\\App\\3D studies\\data.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract JSON part
match = re.search(r'const appData = ({.*});', content, re.DOTALL)
if not match:
    print("Could not find appData object")
    exit(1)

json_str = match.group(1)
# Fix potential trailing commas or other JS-specific syntax if needed
# But assuming the backup is valid JSON-like structure.
# JS object keys might not be quoted? The backup showed quoted keys.
# Let's try to parse. If it fails, we might need a more robust parser or regex.

try:
    data = json.loads(json_str)
except json.JSONDecodeError as e:
    print(f"JSON Parse Error: {e}")
    # Fallback: Use regex to replace IDs and Titles if JSON parsing fails
    # This is riskier but might be necessary if the file uses backticks for strings (which it does for theoryContent)
    # JSON standard doesn't support backticks.
    print("Falling back to regex replacement due to backticks/JS syntax.")
    
    # We will read the file line by line or use regex on the whole content
    new_content = content
    
    # Map for easy explanations
    easy_explanations = [
        "<h2>1. 3D 프린팅 방식</h2><ul><li><strong>FDM</strong>: 플라스틱 실(필라멘트)을 녹여 쌓는 방식. 가장 흔함.</li><li><strong>SLA/DLP</strong>: 액체(레진)를 빛으로 굳히는 방식. 정밀함.</li><li><strong>SLS</strong>: 가루(파우더)를 레이저로 녹이는 방식. 튼튼함.</li></ul><h2>2. 3D 스캐닝</h2><ul><li><strong>접촉식</strong>: 직접 찍어서 측정. 정확하지만 느림.</li><li><strong>비접촉식</strong>: 레이저/빛을 쏘아 측정. 빠름.</li></ul>",
        "<h2>1. 모델링 종류</h2><ul><li><strong>폴리곤</strong>: 삼각형 면으로 구성. 게임 등에 사용.</li><li><strong>넙스(NURBS)</strong>: 곡선이 부드러움. 제품 디자인에 사용.</li></ul><h2>2. 모델링 기능</h2><ul><li><strong>돌출</strong>: 평면을 잡아당겨 입체로 만듦.</li><li><strong>회전</strong>: 축을 중심으로 돌려서 만듦.</li><li><strong>스윕</strong>: 경로를 따라 단면을 이동시킴.</li></ul>",
        "<h2>1. 도면의 기초</h2><ul><li><strong>KS 규격</strong>: 한국 산업 표준.</li><li><strong>척도</strong>: 실물 크기(1:1), 축소(1:2), 확대(2:1).</li></ul><h2>2. 투상도</h2><ul><li><strong>3각법</strong>: 우리가 주로 쓰는 방식. (정면, 평면, 우측면)</li></ul>",
        "<h2>1. 슬라이싱(Slicing)</h2><ul><li>3D 모델을 층층이 자르는 과정.</li><li><strong>G-code</strong>: 프린터가 이해하는 명령어로 변환.</li></ul><h2>2. 출력 설정</h2><ul><li><strong>채우기(Infill)</strong>: 내부를 얼마나 채울지 결정 (보통 15~20%).</li><li><strong>서포터</strong>: 공중에 뜬 부분을 받쳐줌.</li></ul>",
        "<h2>1. 장비 설정</h2><ul><li><strong>레벨링</strong>: 바닥(베드) 수평 맞추기. 가장 중요!</li><li><strong>노즐 온도</strong>: PLA(200도), ABS(230도) 등 재료에 맞게 설정.</li></ul><h2>2. 문제 해결</h2><ul><li><strong>수축</strong>: 재료가 식으면서 줄어드는 현상. (ABS가 심함)</li></ul>",
        "<h2>1. 출력 과정</h2><ul><li>SD카드 삽입 -> 예열 -> 출력 시작 -> 첫 레이어 확인.</li></ul><h2>2. 출력 후 점검</h2><ul><li>출력이 끝나면 온도가 내려갈 때까지 기다린 후 분리.</li><li>스크래퍼 사용 시 손 조심!</li></ul>",
        "<h2>1. 후처리</h2><ul><li><strong>서포터 제거</strong>: 니퍼, 롱노즈 등으로 떼어냄.</li><li><strong>표면 가공</strong>: 사포질(샌딩)로 매끄럽게.</li><li><strong>도색</strong>: 프라이머(밑바탕) -> 본색 -> 마감재.</li></ul>",
        "<h2>1. 안전 수칙</h2><ul><li><strong>환기</strong>: 필라멘트 녹을 때 유해 가스 발생 가능 -> 환기 필수!</li><li><strong>화상 주의</strong>: 노즐은 매우 뜨거움 (200도 이상).</li><li><strong>보호구</strong>: 마스크, 장갑, 보안경 착용.</li></ul>"
    ]

    # Replace IDs and Titles
    # We assume parts are in order 0 to 7 in the file
    # Part 0 -> Part 1
    # Part 1 -> Part 2 ...
    
    # Use a function to replace incrementally to avoid double replacement issues
    # But since we are shifting UP, we should process in REVERSE order if we were doing simple replace.
    # However, regex is safer.
    
    # Let's iterate and find the blocks.
    # Since we can't easily parse JS with backticks in Python standard lib,
    # we will construct the new file string manually by finding "id": "partX" positions.
    
    # Actually, simpler approach:
    # 1. Replace "id": "part0" with "id": "part1_temp"
    # 2. Replace "id": "part1" with "id": "part2_temp" ...
    # 3. Then remove _temp.
    
    for i in range(7, -1, -1): # 7 down to 0
        old_id = f'"id": "part{i}"'
        new_id = f'"id": "part{i+1}"'
        
        old_title_start = f'"title": "Part {i}:'
        new_title_start = f'"title": "Part {i+1}:'
        
        # We also need to insert easyExplanation.
        # It should go after theoryContent.
        # theoryContent ends with `,` usually.
        
        # Let's do the ID and Title replacement first.
        content = content.replace(old_id, new_id)
        content = content.replace(old_title_start, new_title_start)

    # Now insert easyExplanation
    # We look for "questions": [ and insert before it.
    # But we need to know WHICH chapter we are in.
    # This is hard with simple replace.
    
    # Better approach: Split by 'questions": ['
    # The file has 8 occurrences of 'questions": ['.
    # The text BEFORE the 1st occurrence belongs to Part 1 (formerly Part 0).
    # The text BEFORE the 2nd occurrence belongs to Part 2 (formerly Part 1).
    
    parts = content.split('"questions": [')
    
    new_content_parts = []
    for i in range(len(parts) - 1):
        chunk = parts[i]
        # Append easyExplanation to the end of this chunk (which is right before "questions": [)
        # We need to add a comma if not present?
        # Usually theoryContent ends with backtick then comma.
        
        explanation = easy_explanations[i] if i < len(easy_explanations) else ""
        
        # Check if there is a comma at the end of chunk (ignoring whitespace)
        stripped_chunk = chunk.rstrip()
        if not stripped_chunk.endswith(','):
             # It might end with ` which is the end of theoryContent value
             # We should add comma and then the new key
             chunk += ","
        
        chunk += f'\n            "easyExplanation": `{explanation}`,\n            '
        new_content_parts.append(chunk)
    
    new_content_parts.append(parts[-1]) # The last part (after last questions start)
    
    final_content = '"questions": ['.join(new_content_parts)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print("Successfully updated data.js with ID shifts and easy explanations.")

