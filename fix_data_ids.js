const fs = require('fs');
const path = 'D:\\App\\3D studies\\data.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Easy explanations map
    const easyExplanations = [
        "<h2>1. 3D 프린팅 방식</h2><ul><li><strong>FDM</strong>: 플라스틱 실(필라멘트)을 녹여 쌓는 방식. 가장 흔함.</li><li><strong>SLA/DLP</strong>: 액체(레진)를 빛으로 굳히는 방식. 정밀함.</li><li><strong>SLS</strong>: 가루(파우더)를 레이저로 녹이는 방식. 튼튼함.</li></ul><h2>2. 3D 스캐닝</h2><ul><li><strong>접촉식</strong>: 직접 찍어서 측정. 정확하지만 느림.</li><li><strong>비접촉식</strong>: 레이저/빛을 쏘아 측정. 빠름.</li></ul>",
        "<h2>1. 모델링 종류</h2><ul><li><strong>폴리곤</strong>: 삼각형 면으로 구성. 게임 등에 사용.</li><li><strong>넙스(NURBS)</strong>: 곡선이 부드러움. 제품 디자인에 사용.</li></ul><h2>2. 모델링 기능</h2><ul><li><strong>돌출</strong>: 평면을 잡아당겨 입체로 만듦.</li><li><strong>회전</strong>: 축을 중심으로 돌려서 만듦.</li><li><strong>스윕</strong>: 경로를 따라 단면을 이동시킴.</li></ul>",
        "<h2>1. 도면의 기초</h2><ul><li><strong>KS 규격</strong>: 한국 산업 표준.</li><li><strong>척도</strong>: 실물 크기(1:1), 축소(1:2), 확대(2:1).</li></ul><h2>2. 투상도</h2><ul><li><strong>3각법</strong>: 우리가 주로 쓰는 방식. (정면, 평면, 우측면)</li></ul>",
        "<h2>1. 슬라이싱(Slicing)</h2><ul><li>3D 모델을 층층이 자르는 과정.</li><li><strong>G-code</strong>: 프린터가 이해하는 명령어로 변환.</li></ul><h2>2. 출력 설정</h2><ul><li><strong>채우기(Infill)</strong>: 내부를 얼마나 채울지 결정 (보통 15~20%).</li><li><strong>서포터</strong>: 공중에 뜬 부분을 받쳐줌.</li></ul>",
        "<h2>1. 장비 설정</h2><ul><li><strong>레벨링</strong>: 바닥(베드) 수평 맞추기. 가장 중요!</li><li><strong>노즐 온도</strong>: PLA(200도), ABS(230도) 등 재료에 맞게 설정.</li></ul><h2>2. 문제 해결</h2><ul><li><strong>수축</strong>: 재료가 식으면서 줄어드는 현상. (ABS가 심함)</li></ul>",
        "<h2>1. 출력 과정</h2><ul><li>SD카드 삽입 -> 예열 -> 출력 시작 -> 첫 레이어 확인.</li></ul><h2>2. 출력 후 점검</h2><ul><li>출력이 끝나면 온도가 내려갈 때까지 기다린 후 분리.</li><li>스크래퍼 사용 시 손 조심!</li></ul>",
        "<h2>1. 후처리</h2><ul><li><strong>서포터 제거</strong>: 니퍼, 롱노즈 등으로 떼어냄.</li><li><strong>표면 가공</strong>: 사포질(샌딩)로 매끄럽게.</li><li><strong>도색</strong>: 프라이머(밑바탕) -> 본색 -> 마감재.</li></ul>",
        "<h2>1. 안전 수칙</h2><ul><li><strong>환기</strong>: 필라멘트 녹을 때 유해 가스 발생 가능 -> 환기 필수!</li><li><strong>화상 주의</strong>: 노즐은 매우 뜨거움 (200도 이상).</li><li><strong>보호구</strong>: 마스크, 장갑, 보안경 착용.</li></ul>"
    ];

    // Replace IDs and Titles (Part 0 -> Part 1, etc.)
    // We iterate backwards to avoid overlapping replacements if we were doing simple string replace,
    // but here we are specific with the strings.
    for (let i = 7; i >= 0; i--) {
        const oldId = `"id": "part${i}"`;
        const newId = `"id": "part${i + 1}"`;
        const oldTitleStart = `"title": "Part ${i}:`;
        const newTitleStart = `"title": "Part ${i + 1}:`;

        content = content.replace(oldId, newId);
        content = content.replace(oldTitleStart, newTitleStart);
    }

    // Insert easyExplanation
    // Split by '"questions": ['
    const parts = content.split('"questions": [');
    const newContentParts = [];

    for (let i = 0; i < parts.length - 1; i++) {
        let chunk = parts[i];
        const explanation = easyExplanations[i] || "";

        // Check if chunk ends with comma (ignoring whitespace)
        if (!chunk.trim().endsWith(',')) {
            chunk += ",";
        }

        chunk += `\n            "easyExplanation": \`${explanation}\`,\n            `;
        newContentParts.push(chunk);
    }
    newContentParts.push(parts[parts.length - 1]);

    const finalContent = newContentParts.join('"questions": [');

    fs.writeFileSync(path, finalContent, 'utf8');
    console.log("Successfully updated data.js with ID shifts and easy explanations.");

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
