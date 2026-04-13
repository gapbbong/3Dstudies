import json
import re

file_path = r'e:\3D studies\Dukigo+\supabase\final_migration.sql'
broken_questions = []

with open(file_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'INSERT INTO public.dukigo_exam_questions' in line and '""' in line:
            # Try to extract the metadata
            # Format: ('SUBJECT', YEAR, ROUND, NO, 'TEXT', 'OPTIONS'::jsonb, ...)
            try:
                # Basic parsing using regex for the first 4 fields
                match = re.search(r"\('ELECTRICITY',\s*(\d+),\s*(\d+),\s*(\d+),\s*'(.*?)',\s*'(.*?)'::jsonb", line)
                if match:
                    year, rd, no, text, opts_raw = match.groups()
                    broken_questions.append({
                        "line": i + 1,
                        "year": year,
                        "round": rd,
                        "no": no,
                        "text": text[:60] + "...",
                        "options_raw": opts_raw
                    })
                else:
                    broken_questions.append({
                        "line": i + 1,
                        "raw_line": line[:100] + "..."
                    })
            except Exception as e:
                pass

print(f"Found {len(broken_questions)} lines with potentially empty options.")
with open(r'e:\3D studies\Dukigo+\broken_questions_audit.json', 'w', encoding='utf-8') as out:
    json.dump(broken_questions, out, ensure_ascii=False, indent=2)
