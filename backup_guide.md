# 시스템 백업 가이드

> **목적**: 대대적인 업그레이드 전 현재 시스템 안전하게 백업  
> **작성일**: 2025-12-16  
> **중요도**: 🔴 매우 높음

---

## 🎯 백업 목표

1. ✅ 모든 핵심 기능 코드 보존
2. ✅ 데이터 파일 안전 보관
3. ✅ 설정 파일 백업
4. ✅ 빠른 복원 가능 상태 유지
5. ✅ 버전 관리 체계 확립

---

## 📦 백업 대상 파일 목록

### 🔴 필수 백업 파일 (핵심 기능)

#### HTML 파일
```
✅ index.html                    - 메인 학습 페이지
✅ teacher.html                  - 관리자 페이지
```

#### JavaScript 파일
```
✅ js/script.js                  - 메인 로직 (83KB, 2226줄)
✅ js/multi_tab_prevention.js    - 보안 기능
✅ js/teacher_data.js            - 관리자 데이터
✅ google_apps_script.js         - Google Sheets 연동
```

#### 데이터 파일
```
✅ data.js                       - 1단계 데이터 (93KB)
✅ data_practice.js              - 2단계 데이터 (523KB)
✅ data_advanced.js              - 3단계 데이터 (486KB)
```

#### CSS 파일
```
✅ css/style.css                 - 메인 스타일 (24KB)
✅ css/multi_tab_prevention.css  - 보안 UI
✅ css/teacher.css               - 관리자 스타일
```

#### 설정 파일
```
✅ netlify.toml                  - Netlify 배포 설정
✅ favicon.ico                   - 파비콘
```

---

### 🟡 권장 백업 파일 (참고 자료)

#### 이미지 파일
```
📁 images/                       - 모든 이미지 파일 (136개)
   ├── login_circle.png
   ├── part1/ ~ part9/
   └── ...
```

#### 백업 파일 (이전 버전)
```
📁 js/
   ├── script_backup_*.js        - 이전 버전 스크립트
   └── ...

📁 css/
   ├── style_backup_*.css        - 이전 버전 스타일
   └── ...

data_practice_backup_*.js        - 이전 데이터 버전
```

---

### 🟢 선택 백업 파일 (개발 도구)

#### Python 스크립트
```
📁 *.py                          - 데이터 처리 스크립트
   ├── clean_data_js.py
   ├── fix_data_ids.py
   └── ...
```

#### JSON 데이터
```
📁 *.json                        - 추출된 문제 데이터
   ├── part0_questions.json
   ├── part1_questions.json
   └── ...
```

---

## 🔧 백업 방법

### 방법 1: 수동 백업 (권장)

#### Step 1: 백업 폴더 생성

```powershell
# PowerShell에서 실행
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "D:\App\3D studies_backup_$backupDate"
New-Item -ItemType Directory -Path $backupPath
```

#### Step 2: 필수 파일 복사

```powershell
# 메인 HTML 파일
Copy-Item "D:\App\3D studies\index.html" -Destination $backupPath
Copy-Item "D:\App\3D studies\teacher.html" -Destination $backupPath

# JavaScript 폴더
Copy-Item "D:\App\3D studies\js" -Destination "$backupPath\js" -Recurse

# 데이터 파일
Copy-Item "D:\App\3D studies\data.js" -Destination $backupPath
Copy-Item "D:\App\3D studies\data_practice.js" -Destination $backupPath
Copy-Item "D:\App\3D studies\data_advanced.js" -Destination $backupPath

# CSS 폴더
Copy-Item "D:\App\3D studies\css" -Destination "$backupPath\css" -Recurse

# 설정 파일
Copy-Item "D:\App\3D studies\netlify.toml" -Destination $backupPath
Copy-Item "D:\App\3D studies\favicon.ico" -Destination $backupPath
Copy-Item "D:\App\3D studies\google_apps_script.js" -Destination $backupPath

# 이미지 폴더
Copy-Item "D:\App\3D studies\images" -Destination "$backupPath\images" -Recurse

Write-Host "백업 완료: $backupPath" -ForegroundColor Green
```

#### Step 3: 백업 압축 (선택)

```powershell
# ZIP 파일로 압축
Compress-Archive -Path $backupPath -DestinationPath "$backupPath.zip"
Write-Host "압축 완료: $backupPath.zip" -ForegroundColor Green
```

---

### 방법 2: Git 버전 관리 (최고 권장)

#### Step 1: Git 저장소 초기화

```powershell
cd "D:\App\3D studies"

# Git 초기화
git init

# .gitignore 파일 생성
@"
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.whl

# 임시 파일
*.bak
*.tmp
*.log

# 백업 파일 (선택적)
*_backup_*.js
*_backup_*.css
*_backup_*.html
"@ | Out-File -FilePath .gitignore -Encoding UTF8
```

#### Step 2: 초기 커밋

```powershell
# 모든 파일 추가
git add index.html teacher.html
git add js/script.js js/multi_tab_prevention.js js/teacher_data.js
git add data.js data_practice.js data_advanced.js
git add css/style.css css/multi_tab_prevention.css css/teacher.css
git add netlify.toml favicon.ico google_apps_script.js
git add images/

# 커밋
git commit -m "✨ 업그레이드 전 안정 버전 백업 (v12)"
```

#### Step 3: 원격 저장소 연결 (선택)

```powershell
# GitHub에 저장소 생성 후
git remote add origin https://github.com/your-username/3d-printer-study.git
git branch -M main
git push -u origin main
```

#### Step 4: 태그 생성

```powershell
# 현재 버전에 태그 추가
git tag -a v12-stable -m "업그레이드 전 안정 버전"
git push origin v12-stable
```

---

### 방법 3: 자동화 스크립트

#### 백업 스크립트 생성

`backup_system.ps1` 파일 생성:

```powershell
# backup_system.ps1
param(
    [string]$BackupType = "full"  # full, essential, data-only
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$sourceDir = "D:\App\3D studies"
$backupRoot = "D:\App\Backups"
$backupDir = "$backupRoot\3D_studies_$timestamp"

Write-Host "=== 3D 프린터 학습 시스템 백업 ===" -ForegroundColor Cyan
Write-Host "백업 유형: $BackupType" -ForegroundColor Yellow
Write-Host "백업 경로: $backupDir" -ForegroundColor Yellow

# 백업 폴더 생성
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# 필수 파일 백업
function Backup-Essential {
    Write-Host "`n[1/4] HTML 파일 백업 중..." -ForegroundColor Green
    Copy-Item "$sourceDir\index.html" -Destination $backupDir
    Copy-Item "$sourceDir\teacher.html" -Destination $backupDir

    Write-Host "[2/4] JavaScript 파일 백업 중..." -ForegroundColor Green
    Copy-Item "$sourceDir\js" -Destination "$backupDir\js" -Recurse

    Write-Host "[3/4] 데이터 파일 백업 중..." -ForegroundColor Green
    Copy-Item "$sourceDir\data.js" -Destination $backupDir
    Copy-Item "$sourceDir\data_practice.js" -Destination $backupDir
    Copy-Item "$sourceDir\data_advanced.js" -Destination $backupDir

    Write-Host "[4/4] CSS 및 설정 파일 백업 중..." -ForegroundColor Green
    Copy-Item "$sourceDir\css" -Destination "$backupDir\css" -Recurse
    Copy-Item "$sourceDir\netlify.toml" -Destination $backupDir
    Copy-Item "$sourceDir\favicon.ico" -Destination $backupDir
    Copy-Item "$sourceDir\google_apps_script.js" -Destination $backupDir
}

# 전체 백업
function Backup-Full {
    Backup-Essential
    
    Write-Host "`n[추가] 이미지 파일 백업 중..." -ForegroundColor Green
    Copy-Item "$sourceDir\images" -Destination "$backupDir\images" -Recurse
    
    Write-Host "[추가] 백업 파일 백업 중..." -ForegroundColor Green
    Get-ChildItem "$sourceDir\*_backup_*" | Copy-Item -Destination $backupDir
}

# 데이터만 백업
function Backup-DataOnly {
    Write-Host "`n데이터 파일만 백업 중..." -ForegroundColor Green
    Copy-Item "$sourceDir\data.js" -Destination $backupDir
    Copy-Item "$sourceDir\data_practice.js" -Destination $backupDir
    Copy-Item "$sourceDir\data_advanced.js" -Destination $backupDir
}

# 백업 유형에 따라 실행
switch ($BackupType) {
    "full" { Backup-Full }
    "essential" { Backup-Essential }
    "data-only" { Backup-DataOnly }
    default { Backup-Essential }
}

# 백업 정보 파일 생성
$backupInfo = @"
=== 백업 정보 ===
백업 일시: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
백업 유형: $BackupType
원본 경로: $sourceDir
백업 경로: $backupDir

=== 백업된 파일 목록 ===
$(Get-ChildItem -Path $backupDir -Recurse | Select-Object -ExpandProperty FullName)
"@

$backupInfo | Out-File -FilePath "$backupDir\BACKUP_INFO.txt" -Encoding UTF8

# 압축
Write-Host "`n압축 중..." -ForegroundColor Green
Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip" -Force

Write-Host "`n✅ 백업 완료!" -ForegroundColor Green
Write-Host "백업 위치: $backupDir.zip" -ForegroundColor Cyan
Write-Host "백업 크기: $((Get-Item "$backupDir.zip").Length / 1MB) MB" -ForegroundColor Cyan
```

#### 스크립트 실행

```powershell
# 전체 백업
.\backup_system.ps1 -BackupType "full"

# 필수 파일만 백업
.\backup_system.ps1 -BackupType "essential"

# 데이터만 백업
.\backup_system.ps1 -BackupType "data-only"
```

---

## 🔄 복원 절차

### Git에서 복원

```powershell
# 특정 태그로 복원
git checkout v12-stable

# 또는 특정 커밋으로 복원
git checkout <commit-hash>

# 새 브랜치로 복원
git checkout -b restore-v12 v12-stable
```

### 백업 파일에서 복원

```powershell
# ZIP 압축 해제
$backupZip = "D:\App\Backups\3D_studies_20251216_141000.zip"
$restoreDir = "D:\App\3D studies_restored"

Expand-Archive -Path $backupZip -DestinationPath $restoreDir

Write-Host "복원 완료: $restoreDir" -ForegroundColor Green
```

---

## ✅ 백업 검증 체크리스트

### 파일 무결성 확인

```powershell
# 파일 개수 확인
$originalCount = (Get-ChildItem "D:\App\3D studies" -Recurse -File).Count
$backupCount = (Get-ChildItem $backupPath -Recurse -File).Count

Write-Host "원본 파일 수: $originalCount"
Write-Host "백업 파일 수: $backupCount"

if ($originalCount -eq $backupCount) {
    Write-Host "✅ 파일 개수 일치" -ForegroundColor Green
} else {
    Write-Host "⚠️ 파일 개수 불일치" -ForegroundColor Red
}
```

### 필수 파일 존재 확인

```powershell
$essentialFiles = @(
    "index.html",
    "teacher.html",
    "js\script.js",
    "data.js",
    "data_practice.js",
    "data_advanced.js",
    "css\style.css"
)

Write-Host "`n=== 필수 파일 확인 ===" -ForegroundColor Cyan
foreach ($file in $essentialFiles) {
    $exists = Test-Path "$backupPath\$file"
    if ($exists) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (누락!)" -ForegroundColor Red
    }
}
```

### 파일 크기 비교

```powershell
# 주요 파일 크기 비교
$keyFiles = @("js\script.js", "data_practice.js", "data_advanced.js")

Write-Host "`n=== 파일 크기 비교 ===" -ForegroundColor Cyan
foreach ($file in $keyFiles) {
    $originalSize = (Get-Item "D:\App\3D studies\$file").Length
    $backupSize = (Get-Item "$backupPath\$file").Length
    
    Write-Host "$file"
    Write-Host "  원본: $($originalSize / 1KB) KB"
    Write-Host "  백업: $($backupSize / 1KB) KB"
    
    if ($originalSize -eq $backupSize) {
        Write-Host "  ✅ 일치" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ 불일치" -ForegroundColor Yellow
    }
}
```

---

## 📋 백업 체크리스트

업그레이드 전 아래 항목을 모두 확인하세요:

- [ ] **필수 파일 백업 완료**
  - [ ] index.html
  - [ ] teacher.html
  - [ ] js/script.js
  - [ ] js/multi_tab_prevention.js
  - [ ] data.js, data_practice.js, data_advanced.js
  - [ ] css/style.css

- [ ] **백업 검증 완료**
  - [ ] 파일 개수 일치 확인
  - [ ] 파일 크기 일치 확인
  - [ ] 필수 파일 존재 확인

- [ ] **백업 위치 기록**
  - [ ] 백업 경로: `_______________________`
  - [ ] 백업 일시: `_______________________`
  - [ ] 백업 크기: `_______________________`

- [ ] **Git 버전 관리 (선택)**
  - [ ] Git 저장소 초기화
  - [ ] 초기 커밋 완료
  - [ ] 태그 생성 (v12-stable)
  - [ ] 원격 저장소 푸시 (선택)

- [ ] **복원 테스트 (권장)**
  - [ ] 백업에서 임시 폴더로 복원
  - [ ] 복원된 파일 정상 작동 확인
  - [ ] 브라우저에서 index.html 열어 테스트

- [ ] **문서화**
  - [ ] 백업 정보 기록
  - [ ] 주요 변경사항 메모
  - [ ] 복원 절차 숙지

---

## 🎯 백업 모범 사례

### 1. 3-2-1 백업 규칙

- **3개의 복사본**: 원본 + 로컬 백업 + 클라우드 백업
- **2개의 다른 매체**: 하드디스크 + USB/외장하드
- **1개의 오프사이트**: Google Drive, GitHub 등

### 2. 정기 백업 스케줄

- **일일**: 데이터 파일만 (`data*.js`)
- **주간**: 필수 파일 전체
- **월간**: 전체 백업 (이미지 포함)
- **주요 업데이트 전**: 반드시 전체 백업

### 3. 백업 명명 규칙

```
3D_studies_backup_YYYYMMDD_HHMMSS_[type]
예: 3D_studies_backup_20251216_141000_full
```

### 4. 백업 보관 기간

- **최근 7일**: 모든 백업 보관
- **최근 1개월**: 주간 백업 보관
- **최근 1년**: 월간 백업 보관
- **영구**: 주요 마일스톤 백업 (v12-stable 등)

---

## 🚨 긴급 복구 시나리오

### 시나리오 1: 파일 손상

```powershell
# 손상된 파일만 복원
Copy-Item "$backupPath\js\script.js" -Destination "D:\App\3D studies\js\" -Force
```

### 시나리오 2: 전체 시스템 복원

```powershell
# 현재 폴더 백업 (안전장치)
Rename-Item "D:\App\3D studies" "D:\App\3D studies_broken_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# 백업에서 전체 복원
Copy-Item $backupPath -Destination "D:\App\3D studies" -Recurse
```

### 시나리오 3: Git에서 특정 파일만 복원

```powershell
# 특정 파일만 이전 버전으로 복원
git checkout v12-stable -- js/script.js
git checkout v12-stable -- data_practice.js
```

---

## 📞 문제 해결

### Q1: 백업이 너무 큽니다

**A**: 불필요한 파일 제외
```powershell
# .gitignore에 추가
*_backup_*.js
*_backup_*.css
*.pyc
__pycache__/
```

### Q2: 백업 속도가 느립니다

**A**: 증분 백업 사용 (Git 권장)
```powershell
# Git은 변경된 파일만 추적
git add .
git commit -m "업데이트"
```

### Q3: 백업 파일을 찾을 수 없습니다

**A**: 백업 로그 확인
```powershell
# BACKUP_INFO.txt 파일 확인
Get-Content "$backupPath\BACKUP_INFO.txt"
```

---

## 📝 백업 로그 템플릿

```
=== 백업 기록 ===
날짜: 2025-12-16 14:10
담당자: [이름]
백업 유형: 전체 백업
백업 경로: D:\App\Backups\3D_studies_20251216_141000.zip
백업 크기: 1.2 MB

=== 백업 사유 ===
대대적인 시스템 업그레이드 전 안정 버전 보존

=== 검증 결과 ===
✅ 파일 개수: 일치
✅ 파일 크기: 일치
✅ 필수 파일: 모두 존재
✅ 복원 테스트: 성공

=== 비고 ===
- Git 태그: v12-stable
- 다음 백업 예정: 업그레이드 완료 후
```

---

**작성자**: Antigravity AI  
**최종 업데이트**: 2025-12-16 14:10 KST  
**문의**: 백업 관련 문제 발생 시 이 문서 참조
