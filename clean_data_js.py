import re

file_path = r'd:\App\3d Studies\data.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove PDF Artifacts (Page headers/footers)
# Pattern: 3 digits + PAR + 2 digits + text
content = re.sub(r'\d{3}\s+PAR\s+\d{2}.*', '', content)
# Pattern: CHAPER + digits + text
content = re.sub(r'CHAPER\s+\d+.*', '', content)
# Pattern: Page numbers at end of lines or standalone lines like "244 PAR 07제품출력"
content = re.sub(r'\d{3}\s+PAR\s+\d{2}\s+.*', '', content)
# Pattern: "출제예상문제" headers
content = re.sub(r'.*출제예상문제.*', '', content)
# Pattern: "프린터운용기능사 자격증 대비과정"
content = re.sub(r'.*프린터운용기능사 자격증 대비과정.*', '', content)

# 2. Fix OCR Garbage & Typos
replacements = [
    (r'Mesmixer', 'Meshmixer'),
    (r'Netfabb', 'Netfabb'), # Just ensuring capitalization
    (r'CA 응용프로그램', 'CAD 응용프로그램'),
    (r'CA 모델링', 'CAD 모델링'),
    (r'CA 모델', 'CAD 모델'),
    (r'■u', ''),
    (r'rlE', ''),
    (r'_ ro인 며 ! 山 I', ''),
    (r'一', '-'), # Replace weird dash with hyphen
    (r'—', '-'), # Replace em dash with hyphen
    (r'츠居', '착용'),
    (r'츠塔', '착용'),
    (r'무 높을', '너무 높을'),
    (r'무 많이', '너무 많이'),
    (r'무 빠', '너무 빠'),
    (r'무 클', '너무 클'),
    (r'무 빠르게', '너무 빠르게'),
    (r'무 낮은', '너무 낮은'),
    (r'기 이빨', '기어 이빨'),
    (r'리트렉션', '리트랙션'),
    (r'H설 I', '해설:'),
    (r'해설 :', '해설:'),
    (r'해설 I', '해설:'),
    (r'! I', ''),
    (r'①', '①'), # Ensure circles are kept (or normalized if needed)
    (r'②', '②'),
    (r'③', '③'),
    (r'④', '④'),
    (r'卞', ''),
    (r'々', ''),
    (r'까， ， .山.', ''),
    (r'투시부 머리끈 연결관 격장 안면부', ''),
    (r'배기밸브 여과제', ''), # Stray text
    (r'dg 빠 Ja', ''),
    (r'■UA   \^ Jffl olon  l l o l t p g', ''),
    (r'犯프린터운용기능사', ''),
    (r'□프린터문용기능사 필기', ''),
    (r'\(가\)', '(가)'), # Normalize brackets if needed
    (r'\(나\)', '(나)'),
    (r'->', '→'), # Standardize arrows
    (r' - ', ' → '), # Context dependent, but often used as arrow in this text
    (r'CA 응용프로 그램', 'CAD 응용프로그램'),
    (r'프린팅 가능 성', '프린팅 가능성'),
    (r'자동복구', '자동 복구'),
    (r'생성하 여', '생성하여'),
    (r'생성하지 는', '생성하지는'),
    (r'수 동', '수동'),
    (r'검 출', '검출'),
    (r'수정되 지', '수정되지'),
    (r'경 우', '경우'),
    (r'비 슷한', '비슷한'),
    (r'결합 은', '결합은'),
    (r'소프트웨 에서', '소프트웨어에서'),
    (r'이루져', '이루어져'),
    (r'수 정', '수정'),
    (r'소프트웨가', '소프트웨어가'),
    (r'C A', 'CAD'),
    (r'소프트웨에서', '소프트웨어에서'),
    (r'발생 한다', '발생한다'),
    (r'빼주 는', '빼주는'),
    (r'빠 를', '빠를'),
    (r'과열되 었을', '과열되었을'),
    (r'너너무', '너무'),
    (r'설정 한다', '설정한다'),
    (r'최 대 회 전 속도를', '최대 회전 속도를'),
    (r'250rpm으 로', '250rpm으로'),
    (r'설 정한다', '설정한다'),
    (r'주파수 로', '주파수로'),
    (r'등 의', '등의'),
    (r'무리하 게', '무리하게'),
    (r'불 순물', '불순물'),
    (r'플랫 폼', '플랫폼'),
    (r'착 용한', '착용한'),
    (r'흡입 기를', '흡입기를'),
    (r'우선 할것', '우선할 것'),
    (r'위험01', '위험이'),
    (r'등으 로부터', '등으로부터'),
    (r'되 있는', '되어 있는'),
    (r'마스 크의', '마스크의'),
    (r'종 류는', '종류는'),
    (r'결핍되 있거나', '결핍되어 있거나'),
    (r'도 장', '도장'),
    (r'점검 을', '점검을'),
    (r'파손되 지', '파손되지'),
    (r'교 체를', '교체를'),
    (r'확인 하는', '확인하는'),
    (r'너+무', '너무'), # Fix repeated characters
    (r'에컨', '에어컨'),
    (r'〜', '~'),
    (r'이동 • 교체를', '이동, 교체를'),
    (r'이동 • 교 체를', '이동, 교체를'),
    (r'교 체를', '교체를'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# 3. Fix "一" used as arrow or dash
# "크기 확인 一 공차 확인" -> "크기 확인 → 공차 확인"
content = re.sub(r'(\w+)\s*一\s*(\w+)', r'\1 → \2', content)
content = re.sub(r'(\w+)\s*-\s*(\w+)', r'\1 → \2', content) # Fix hyphens that should be arrows in sequences

# 4. Clean up multiple spaces and newlines
content = re.sub(r'\n\s*\n', '\n', content) # Remove empty lines
content = re.sub(r' +', ' ', content) # Collapse multiple spaces

# 5. Fix specific weird lines identified
content = content.replace('크그 I 확인', '크기 확인')
content = content.replace('채 우기', '채우기')
content = content.replace('05 다음에서 설명하는 출력용 파일의 종류로 맞는것은?', '') # Remove accidentally merged next question

# 6. Fix "M104 S20" explanation typo
content = content.replace('S20 : 온도는 20°C', 'S20 : 온도는 20°C (문제 오류 가능성, 보통 200도 내외이나 문제 그대로 해석)')

# 7. Fix "M104 S20" question choices typo (if any)
# Checked: Choices look okay, just weird spacing.

# 8. Fix "Oz Mesmixer" -> "Meshmixer"
content = content.replace('Oz Mesmixer', 'Meshmixer')

# 9. Fix "2 도면" -> "2D 도면"
content = content.replace('2 도면', '2D 도면')

# 10. Fix "surface" -> "Surface" (Capitalization)
content = content.replace('surface', 'Surface')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleanup complete.")
