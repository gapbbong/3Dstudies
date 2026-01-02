const teacherData = {
    "part1": [
        {
            "type": "image",
            "src": "images/fdm.png",
            "text": "FDM 방식\n플라스틱 실(필라멘트)을 녹여서 쌓기\n가장 흔하고 저렴한 방식"
        },
        {
            "type": "image",
            "src": "images/sla.png",
            "text": "SLA 방식\n액체 수지에 레이저를 쏘아 굳히기\n표면이 매우 매끄러움"
        },
        {
            "type": "image",
            "src": "images/sls.png",
            "text": "SLS 방식\n가루(파우더)를 레이저로 녹여 붙이기\n서포터(지지대)가 필요 없음!"
        },
        {
            "type": "image",
            "src": "images/scanner.png",
            "text": "3D 스캐너\n실제 물건을 컴퓨터로 옮기는 기계\n레이저로 물건의 모양을 측정"
        },
        {
            "type": "text",
            "text": "📌 3D 프린팅 비교\n\nFDM: 저렴, 튼튼, 표면 거침\nSLA: 정밀, 매끄러움, 비쌈\nSLS: 매우 튼튼, 서포터 불필요, 가장 비쌈"
        }
    ],
    "part2": [
        {
            "type": "image",
            "src": "images/polygon.png",
            "text": "폴리곤 모델링\n삼각형 면을 이어붙여 만들기\n게임 캐릭터 제작에 사용"
        },
        {
            "type": "image",
            "src": "images/nurbs.png",
            "text": "NURBS 모델링\n부드러운 곡선으로 만들기\n자동차, 비행기 디자인에 사용"
        },
        {
            "type": "image",
            "src": "images/extrude.png",
            "text": "돌출(Extrude)\n평면 도형을 잡아당겨 입체로!\n가장 기본적인 모델링 방법"
        },
        {
            "type": "text",
            "text": "📌 회전(Revolve)\n\n단면을 축을 기준으로 빙글빙글 돌려서\n원통, 컵, 항아리 같은 모양을 만듭니다.\n\n예: 컵 단면 → 360도 회전 → 컵 완성!"
        },
        {
            "type": "text",
            "text": "📌 로프트(Loft)\n\n여러 개의 단면을 부드럽게 연결해서\n복잡한 곡면을 만듭니다.\n\n예: 비행기 날개, 병 모양"
        },
        {
            "type": "text",
            "text": "📌 서포터(Support)\n\n공중에 떠있는 부분을 받쳐주는 구조물\n출력 후 손으로 제거합니다.\n\n래프트: 바닥 보조판\n브림: 가장자리 넓히기"
        }
    ],
    "part3": [
        {
            "type": "text",
            "text": "📌 투상도\n\n3D 물체를 2D 종이에 그리는 방법\n\n정면도: 앞에서 본 모습\n평면도: 위에서 본 모습\n측면도: 옆에서 본 모습"
        },
        {
            "type": "text",
            "text": "📌 제3각법\n\n우리나라가 사용하는 투상법\n\n배치 순서:\n좌측면도 - 정면도 - 우측면도\n         평면도"
        },
        {
            "type": "text",
            "text": "📌 치수 기입\n\n도면에 크기를 숫자로 표시\n\n원칙:\n• 중복하지 않기\n• 명확하게 표시\n• 정면도에 집중"
        },
        {
            "type": "text",
            "text": "📌 어셈블리(조립)\n\n부품들을 하나로 합치기\n\n상향식: 부품 먼저 만들고 조립\n하향식: 조립하면서 부품 만들기"
        },
        {
            "type": "text",
            "text": "📌 불(Boolean) 연산\n\n합집합(Union): 두 개를 하나로\n차집합(Difference): 빼기\n교집합(Intersection): 겹치는 부분만"
        }
    ],
    "part5": [
        {
            "type": "text",
            "text": "📌 3D 프린터의 핵심 원리\n\n'글루건'을 생각해보세요!\n\n1. 필라멘트(재료)를 뒤에서 밀어주고\n2. 뜨거운 노즐이 재료를 녹여서\n3. 바닥에 한 층씩 쌓아 올립니다."
        },
        {
            "type": "image",
            "src": "images/extruder.png",
            "text": "익스트루더 (재료 밀어주는 장치)\n\n치약을 짜듯이 필라멘트를\n노즐 쪽으로 꾹꾹 밀어주는 역할을 해요."
        },
        {
            "type": "image",
            "src": "images/nozzle.png",
            "text": "노즐과 핫엔드 (녹이는 장치)\n\n매우 뜨거운 부분입니다! (약 200도)\n재료를 물처럼 녹여서 가늘게 뽑아냅니다.\n*손대면 화상 입어요! 조심!*"
        },
        {
            "type": "image",
            "src": "images/bed.png",
            "text": "히팅 베드 (따뜻한 바닥)\n\n출력물이 바닥에 잘 붙어있게 도와줘요.\n식으면 수축해서 떨어질 수 있어서\n출력 중에는 계속 따뜻하게 유지합니다."
        },
        {
            "type": "text",
            "text": "📌 레벨링 (수평 맞추기)\n\n가장 중요한 단계! ⭐\n\n노즐과 바닥 사이의 간격을\n'종이 한 장' 두께로 맞춰야 해요.\n\n너무 멀면? → 재료가 공중에서 꼬불꼬불~\n너무 가까우면? → 재료가 안 나와요!"
        },
        {
            "type": "text",
            "text": "📌 온도 설정 (재료마다 달라요)\n\nPLA (옥수수 전분): 200도 정도\nABS (레고 재질): 240도 정도\n\n재료의 특성에 맞게 온도를 조절해야\n예쁘고 튼튼하게 출력됩니다."
        }
    ]
};
