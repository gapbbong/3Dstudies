
import fitz  # PyMuPDF
import json
import os
import re

def extract_quiz_data(pdf_path, output_dir):
    doc = fitz.open(pdf_path)
    
    # Create images directory
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    questions = []
    current_question = None
    
    # Regex patterns
    # Question start: Number followed by dot or space, then text. 
    # We need to be careful not to match "1.2" as a question.
    # Usually questions are "1.", "01.", "1 ", "01 " at the start of a line.
    question_start_pattern = re.compile(r"^\s*(\d+)\s*[.．]?\s+(.*)")
    
    # Choices: ①, ②, ③, ④, ⑤ or (1), (2)... or 1), 2)...
    # We will look for these markers.
    choice_markers = [r"①", r"②", r"③", r"④", r"⑤", r"❶", r"❷", r"❸", r"❹", r"❺", r"\(\d+\)", r"\d+\)"]
    choice_pattern = re.compile(r"^\s*(" + "|".join(choice_markers) + r")\s*(.*)")
    
    # Answer and Explanation
    answer_pattern = re.compile(r"^\s*(정답|답)\s*[:：]?\s*(.*)")
    explanation_pattern = re.compile(r"^\s*(해설|풀이)\s*[:：]?\s*(.*)")

    all_lines = []
    
    # First pass: Collect all lines with metadata
    for page_num, page in enumerate(doc):
        blocks = page.get_text("blocks")
        blocks.sort(key=lambda b: (b[1], b[0]))
        
        for b in blocks:
            text = b[4]
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                if line:
                    all_lines.append({
                        "text": line,
                        "page": page_num + 1,
                        "rect": b[:4] # x0, y0, x1, y1
                    })

    # Second pass: Process lines
    for i, line_data in enumerate(all_lines):
        text = line_data["text"]
        
        # Check for Answer/Explanation first (usually at end of question or block)
        # But sometimes they are separate.
        
        # Check for Question Start
        # Heuristic: A number at start, and previous line was likely end of previous content.
        # Also check if the number is sequential? (Optional but good)
        
        q_match = question_start_pattern.match(text)
        if q_match:
            # Check if it's really a question. 
            # Sometimes "1. Introduction" is a header.
            # Questions usually have a question mark? Not always.
            # Let's assume it is if it looks like "01. Question text"
            
            q_num = q_match.group(1)
            q_content = q_match.group(2)
            
            # Heuristic: If q_num is 1 and we already have questions, it might be a new section.
            # Just add it.
            
            # Save previous
            if current_question:
                questions.append(current_question)
            
            current_question = {
                "number": q_num,
                "question": q_content,
                "choices": [],
                "image": None,
                "answer": None,
                "explanation": None,
                "page": line_data["page"]
            }
            continue
        
        if current_question:
            # Check for choices
            # Split line if it contains multiple choices? 
            # e.g. "① A   ② B"
            # This is hard with regex alone. 
            # Let's try to find all markers in the line.
            
            # Simple check: does line start with a marker?
            c_match = choice_pattern.match(text)
            if c_match:
                current_question["choices"].append(text)
                continue
                
            # Check for answer
            a_match = answer_pattern.match(text)
            if a_match:
                current_question["answer"] = a_match.group(2)
                continue
                
            # Check for explanation
            e_match = explanation_pattern.match(text)
            if e_match:
                current_question["explanation"] = e_match.group(2)
                continue
            
            # Otherwise, append to last field
            if current_question["explanation"] is not None:
                current_question["explanation"] += " " + text
            elif current_question["answer"] is not None:
                # If answer is set but explanation is not, and we find text, is it explanation?
                # Usually yes.
                current_question["explanation"] = text
            elif current_question["choices"]:
                current_question["choices"][-1] += " " + text
            else:
                current_question["question"] += " " + text

    # Extract images (same as before)
    # ... (We need to re-run image extraction or keep it)
    # Since we are rewriting the loop, we need to handle images too.
    # But images are page-based. We can associate them by page number.
    
    # Let's do image extraction separately and link by page
    # Or better: link by proximity?
    # For now, link by page is safest.
    
    # Re-iterate pages for images
    for page_num, page in enumerate(doc):
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"page_{page_num+1}_img_{img_index}.{image_ext}"
            image_path = os.path.join(images_dir, image_filename)
            
            # Only save if not exists (to save time)
            if not os.path.exists(image_path):
                with open(image_path, "wb") as f:
                    f.write(image_bytes)
            
            # Assign to questions on this page
            # Find questions on this page
            page_qs = [q for q in questions if q["page"] == page_num + 1]
            if page_qs:
                # Assign to the last question on the page? Or all?
                # Usually image belongs to the question BEFORE it or AFTER it.
                # Let's assign to the last one for now.
                page_qs[-1]["image"] = f"images/{image_filename}"
            elif current_question and current_question["page"] == page_num + 1:
                 current_question["image"] = f"images/{image_filename}"

    # Add last question
    if current_question:
        questions.append(current_question)
        
    output_json = os.path.join(output_dir, "quiz.json")
    
    # Filter out items that are likely theory/headers (no answer AND no explanation)
    # Real questions in this PDF seem to always have an extracted answer or explanation section.
    filtered_questions = []
    for q in questions:
        # Check if it has an answer OR explanation
        # Also check if it has choices (optional, but good for multiple choice)
        # We'll be strict: Must have (Answer OR Explanation)
        if q['answer'] or q['explanation']:
            filtered_questions.append(q)
        else:
            # Log dropped items for debugging (optional)
            # print(f"Dropped item {q['number']} (likely theory): {q['question'][:30]}...")
            pass

    print(f"Extracted {len(filtered_questions)} valid questions (filtered out {len(questions) - len(filtered_questions)} theory items).")

    # Save to JSON
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(filtered_questions, f, ensure_ascii=False, indent=2)
    print(f"Saved to {output_json}")

if __name__ == "__main__":
    pdf_file = "3D 프린터 운용 기능사 필기 책 스캔 2권중1_OCR_part 0 제품 스캐닝.pdf"
    extract_quiz_data(pdf_file, ".")

