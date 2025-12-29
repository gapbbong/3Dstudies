import requests
import json

API_KEY = 'AIzaSyAhKsYJjjgUSfGvvMCEVQgYRbyxRTWn1jM'
MODEL_NAME = 'gemini-2.5-flash-lite'
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"

headers = {
    'Content-Type': 'application/json'
}

payload = {
    "contents": [{
        "parts": [{
            "text": "SYSTEM: You are a helpful AI tutor. Answer in Korean.\nUSER: 3D 프린터가 뭐야? 짧게 설명해줘."
        }]
    }]
}

print(f"Testing Model: {MODEL_NAME}")
print(f"URL: {URL}")

try:
    response = requests.post(URL, headers=headers, data=json.dumps(payload))
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if 'candidates' in data and len(data['candidates']) > 0:
            content = data['candidates'][0]['content']['parts'][0]['text']
            print("\n--- Success! Response ---")
            print(content)
            print("-------------------------")
        else:
            print("Response received but no candidates found.")
            print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print("Request failed.")
        print(response.text)

except Exception as e:
    print(f"An error occurred: {e}")
