import json
import glob
import os

def count_questions():
    files = sorted(glob.glob('data/2015_*_questions.json'))
    for f in files:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            print(f"{os.path.basename(f)}: {len(data)} questions")

if __name__ == "__main__":
    count_questions()
