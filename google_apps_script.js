// Google Apps Script for 3D Printer Study App
// Version: 2.0 (UserData Support)

function doGet(e) {
    const params = e.parameter;
    const type = params.type;

    if (type === 'get_user_data') {
        return getUserData(params.name);
    } else if (type === 'leaderboard') {
        return getLeaderboard();
    }

    // Default: Return simple JSON to confirm it's working
    return ContentService.createTextOutput(JSON.stringify({ status: 'ready', message: '3D Printer Study API' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        if (data.type === 'update_user_data') {
            return updateUserData(data);
        } else {
            // Legacy support or simple logging
            return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Legacy post ignored' }))
                .setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function getUserData(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("UserData");
    if (!sheet) {
        sheet = ss.insertSheet("UserData");
        sheet.appendRow(["Name", "Temperature", "TypingAttempts", "Progress", "Stats", "WrongCounts", "LastUpdate"]);
    }

    const data = sheet.getDataRange().getValues();
    // Skip header
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === name) {
            return ContentService.createTextOutput(JSON.stringify({
                status: 'success',
                data: {
                    name: data[i][0],
                    temperature: Number(data[i][1]) || 10,
                    typingAttempts: data[i][2] ? JSON.parse(data[i][2]) : {},
                    progress: data[i][3] ? JSON.parse(data[i][3]) : {},
                    stats: data[i][4] ? JSON.parse(data[i][4]) : {},
                    wrongCounts: data[i][5] ? JSON.parse(data[i][5]) : {}
                }
            })).setMimeType(ContentService.MimeType.JSON);
        }
    }

    // New user
    return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: {
            name: name,
            temperature: 10,
            typingAttempts: {},
            progress: {},
            stats: {},
            wrongCounts: {}
        },
        isNew: true
    })).setMimeType(ContentService.MimeType.JSON);
}

function updateUserData(data) {
    const lock = LockService.getScriptLock();
    try {
        // Wait for up to 10 seconds for other processes to finish
        lock.waitLock(10000);
    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Server is busy, please try again.' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName("UserData");
        if (!sheet) {
            sheet = ss.insertSheet("UserData");
            sheet.appendRow(["Name", "Temperature", "TypingAttempts", "Progress", "Stats", "WrongCounts", "LastUpdate"]);
        }

        const name = data.name;
        const rows = sheet.getDataRange().getValues();
        let rowIndex = -1;

        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === name) {
                rowIndex = i + 1;
                break;
            }
        }

        const timestamp = new Date();
        const temp = data.temperature || 10;
        const typing = JSON.stringify(data.typingAttempts || {});
        const progress = JSON.stringify(data.progress || {});
        const stats = JSON.stringify(data.stats || {});
        const wrong = JSON.stringify(data.wrongCounts || {});

        if (rowIndex > 0) {
            // Update existing
            sheet.getRange(rowIndex, 2, 1, 6).setValues([[temp, typing, progress, stats, wrong, timestamp]]);
        } else {
            // Append new
            sheet.appendRow([name, temp, typing, progress, stats, wrong, timestamp]);
        }

        // Also update Leaderboard sheet for backward compatibility
        if (data.stats) {
            updateLeaderboardSheet(name, data.stats);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data updated' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function updateLeaderboardSheet(name, stats) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Leaderboard");
    if (!sheet) {
        sheet = ss.insertSheet("Leaderboard");
        sheet.appendRow(["Name", "Total Score", "Last Update"]);
    }

    // Calculate total score (sum of best scores)
    let totalScore = 0;
    Object.values(stats).forEach(s => {
        totalScore += (s.bestScore || 0);
    });

    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === name) {
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex > 0) {
        sheet.getRange(rowIndex, 2, 1, 2).setValues([[totalScore, new Date()]]);
    } else {
        sheet.appendRow([name, totalScore, new Date()]);
    }
}

function getLeaderboard() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Leaderboard");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

    const data = sheet.getDataRange().getValues();
    const leaderboard = [];

    for (let i = 1; i < data.length; i++) {
        leaderboard.push({
            name: data[i][0],
            score: Number(data[i][1]) || 0,
            date: data[i][2]
        });
    }

    // Sort by score desc
    leaderboard.sort((a, b) => b.score - a.score);

    return ContentService.createTextOutput(JSON.stringify(leaderboard.slice(0, 50)))
        .setMimeType(ContentService.MimeType.JSON);
}
