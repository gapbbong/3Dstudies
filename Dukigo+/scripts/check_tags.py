import json
import glob
import os

def check_sync():
    mapping = {
        "01": range(1, 11),
        "02": range(11, 20),
        "04": range(20, 29),
        "05": range(29, 39)
    }
    
    # Load crops from the gallery data logic
    # (Simulated for planning)
    results = {}
    for round_id, part_range in mapping.items():
        json_path = f"data/2015_{round_id}_questions.json"
        tag_count = 0
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                tag_count = sum(1 for q in data if "[그림 참고]" in q["question"])
        results[round_id] = tag_count
    
    for r, count in results.items():
        print(f"Round {r}: {count} tags needing images")

if __name__ == "__main__":
    check_sync()
