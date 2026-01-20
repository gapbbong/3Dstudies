/**
 * Yearly Cram Mode - Dedicated Google Apps Script v3
 * Features: Result Saving, Class-based Ranking, Initial Data Sync
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME = "CramResults";

function doGet(e) {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
        return createJsonResponse({ status: 'error', message: 'Sheet not found' });
    }

    // 1. Get Ranking for a specific class (First 2 digits of Name/ID)
    if (action === 'getRanking') {
        const studentClass = e.parameter.class; // e.g., "27"
        const data = sheet.getDataRange().getValues();
        const rankingsMap = {};

        // Skip header, process each row
        for (let i = 1; i < data.length; i++) {
            const name = String(data[i][1]);
            if (name.startsWith(studentClass)) {
                const score = Number(data[i][3]) || 0;
                const chapter = String(data[i][2]);

                if (!rankingsMap[name]) {
                    rankingsMap[name] = { name: name, bestScore: 0, passedChapters: new Set() };
                }
                rankingsMap[name].bestScore = Math.max(rankingsMap[name].bestScore, score);
                if (score >= 80) { // Assuming 80+ is a pass for ranking merit
                    rankingsMap[name].passedChapters.add(chapter);
                }
            }
        }

        const rankings = Object.values(rankingsMap).map(r => ({
            name: r.name,
            score: r.bestScore,
            passed: r.passedChapters.size
        })).sort((a, b) => b.score - a.score || b.passed - a.passed);

        return createJsonResponse({ status: 'success', rankings: rankings.slice(0, 30) });
    }

    // 2. Sync Initial Student Data (Total points, Passed chapters)
    if (action === 'getStudentData') {
        const name = e.parameter.name;
        const data = sheet.getDataRange().getValues();
        const passedChapters = new Set();
        let totalCorrect = 0;
        let totalWrong = 0;

        for (let i = 1; i < data.length; i++) {
            if (String(data[i][1]) === name) {
                const score = Number(data[i][3]) || 0;
                const chapterFull = String(data[i][2]);
                const chapterClean = chapterFull.replace(" (마스터 학습)", "").replace(" (벼락치기)", "");
                const wrongList = String(data[i][4] || "없음");

                let wrongCount = 0;
                if (wrongList !== "없음" && wrongList.trim() !== "") {
                    wrongCount = wrongList.split(',').length;
                }

                // Assuming fixed 30 questions per session
                const currentCorrect = score >= 0 ? Math.round((score / 100) * 30) : 0;

                totalCorrect += currentCorrect;
                totalWrong += wrongCount;

                if (score >= 80) passedChapters.add(cidFromChapter(chapterClean));
            }
        }

        return createJsonResponse({
            status: 'success',
            passedChapters: Array.from(passedChapters),
            totalCorrect: totalCorrect,
            totalWrong: totalWrong
        });
    }

    return createJsonResponse({ status: 'ready', message: 'Cram Mode API v3' });
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAME);

        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAME);
            sheet.appendRow(["제출일시", "학번이름", "항목", "점수", "틀린문제", "시작시간", "소요시간(분)", "자리비움횟수"]);
        }

        sheet.appendRow([
            new Date(),
            data.name,
            data.chapter,
            data.score,
            data.wrong_questions,
            data.startTime,
            data.duration,
            data.idleCount || 0
        ]);

        return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function createJsonResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Convert chapter title back to CID
function cidFromChapter(title) {
    // Expected title: "2023 1부"
    const parts = title.split(" ");
    if (parts.length >= 2) {
        return `cram_${parts[0]}_${parts[1]}`;
    }
    return title;
}
