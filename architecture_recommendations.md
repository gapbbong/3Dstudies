# 아키텍처 결정 권장사항

> **작성일**: 2025-12-16  
> **목적**: 핵심 아키텍처 결정에 대한 상세 분석 및 권장사항

---

## 1️⃣ 데이터베이스 구조 결정

### 🏆 권장: **옵션 A - 학교별 스프레드시트 분리**

#### 선택 이유

**현재 시스템 규모 분석:**
- 단일 학교 데이터: 약 1.1MB (3단계 데이터 합산)
- 학생 수: 추정 50~100명
- Google Sheets 용량 제한: 시트당 500만 셀

**학교별 분리가 더 나은 이유:**

1. **확장성 보장** ⭐⭐⭐⭐⭐
   - 학교 수가 10개로 늘어나도 각 시트는 독립적
   - 한 학교의 데이터 증가가 다른 학교에 영향 없음
   - Google Sheets API 쿼터를 학교별로 분산

2. **성능 최적화** ⭐⭐⭐⭐⭐
   ```
   단일 시트 (10개 학교):
   - 학생 500명 × 10개 학교 = 5,000행
   - 검색 시간: O(5000)
   
   분리 시트 (학교별):
   - 학생 500명 × 1개 학교 = 500행
   - 검색 시간: O(500)
   → 10배 빠름!
   ```

3. **보안 강화** ⭐⭐⭐⭐⭐
   - 학교별 독립된 Google Sheets 권한
   - 한 학교 관리자가 다른 학교 데이터 접근 불가
   - 데이터 유출 시 피해 범위 최소화

4. **백업 및 복원 용이성** ⭐⭐⭐⭐
   - 학교별 독립 백업 가능
   - 특정 학교만 복원 가능
   - 문제 발생 시 해당 학교만 롤백

5. **유지보수 편의성** ⭐⭐⭐⭐
   - 학교 추가/제거가 간단 (새 시트 생성/삭제)
   - 학교별 커스터마이징 가능
   - 독립적인 업데이트 가능

#### 단점 및 해결 방안

**단점 1: 관리 복잡도 증가**
- 해결: Master Spreadsheet로 중앙 관리
- Schools 시트에서 모든 학교 정보 통합 관리

**단점 2: 통합 분석 어려움**
- 해결: 
  ```javascript
  // 전체 학교 데이터 조회 함수
  async function getAllSchoolsData() {
    const schools = await getSchools();
    const allData = [];
    
    for (const school of schools) {
      const data = await getSchoolData(school.id);
      allData.push(...data);
    }
    
    return allData;
  }
  ```

**단점 3: 초기 설정 시간**
- 해결: 학교 생성 자동화 스크립트 제공
- 템플릿 시트 복사로 5분 내 생성 가능

---

### ❌ 비권장: 옵션 B - 단일 시트 + SchoolID

#### 선택하지 않는 이유

1. **성능 저하 위험** 🔴
   - 학교 10개, 학생 500명씩 = 5,000행
   - 학교 50개로 확장 시 = 25,000행
   - Google Sheets에서 느려짐

2. **보안 취약** 🔴
   - 모든 학교 데이터가 한 시트에
   - 실수로 다른 학교 데이터 수정 가능
   - WHERE 절 누락 시 전체 데이터 노출

3. **확장성 제한** 🔴
   - Google Sheets 500만 셀 제한 도달 가능
   - 데이터 증가 시 마이그레이션 필수

#### 이 방식이 적합한 경우

- 학교 수가 3개 이하로 고정
- 학생 수가 학교당 50명 이하
- 통합 분석이 매우 빈번한 경우

**결론: 현재 요구사항에는 부적합**

---

## 2️⃣ 학교 식별자 형식 결정

### 🏆 권장: **코드 기반 (SCH001, SCH002, ...)**

#### 선택 이유

1. **간결성** ⭐⭐⭐⭐⭐
   ```
   코드 기반: SCH001 (6자)
   도메인 기반: seoul-gangnam-hs (17자)
   
   URL 예시:
   ✅ /api/schools/SCH001/students
   ❌ /api/schools/seoul-gangnam-hs/students
   ```

2. **안정성** ⭐⭐⭐⭐⭐
   - 학교 이름 변경 시에도 ID 유지
   - 예: "서울고등학교" → "서울과학고등학교"
   - 코드는 그대로 SCH001 유지

3. **순차 관리 용이** ⭐⭐⭐⭐
   ```javascript
   // 새 학교 추가 시
   const lastSchool = schools[schools.length - 1];
   const lastNum = parseInt(lastSchool.id.replace('SCH', ''));
   const newId = `SCH${String(lastNum + 1).padStart(3, '0')}`;
   // SCH001 → SCH002 → SCH003
   ```

4. **데이터베이스 인덱싱 효율** ⭐⭐⭐⭐
   - 고정 길이 (6자)
   - 숫자 기반 정렬 가능
   - 인덱스 크기 최소화

5. **국제화 대응** ⭐⭐⭐⭐
   - 한글/영문 학교명 변경 시에도 안정적
   - 다국어 지원 시 유리

#### 구현 예시

```javascript
// 학교 ID 생성 함수
function generateSchoolId() {
  const schools = getAllSchools();
  const maxNum = schools.reduce((max, school) => {
    const num = parseInt(school.id.replace('SCH', ''));
    return Math.max(max, num);
  }, 0);
  
  return `SCH${String(maxNum + 1).padStart(3, '0')}`;
}

// 사용 예시
const newSchool = {
  id: generateSchoolId(), // SCH004
  name: "부산과학고등학교",
  domain: "busan-science.hs.kr"
};
```

---

### ⚠️ 도메인 기반의 문제점

1. **길이 가변성** 🟡
   ```
   SCH001: 6자 (고정)
   seoul-hs: 8자
   seoul-gangnam-science-hs: 24자
   ```

2. **변경 위험** 🔴
   ```
   초기: seoul-hs
   학교명 변경: seoul-science-hs
   → 모든 데이터 마이그레이션 필요
   ```

3. **중복 가능성** 🟡
   ```
   서울고등학교: seoul-hs
   서울과학고등학교: seoul-science-hs
   서울예술고등학교: seoul-art-hs
   
   vs
   
   SCH001, SCH002, SCH003 (중복 불가능)
   ```

---

## 📊 최종 권장사항 요약

| 항목 | 권장 선택 | 이유 |
|------|----------|------|
| **DB 구조** | 학교별 스프레드시트 분리 | 확장성, 성능, 보안 |
| **학교 ID** | 코드 기반 (SCH001) | 안정성, 간결성, 관리 용이 |

---

## 🎯 구현 시 주의사항

### 1. Master Spreadsheet 구조

```
📁 Master Control Spreadsheet
├─ Schools 시트
│  ├─ SchoolID (Primary Key)
│  ├─ SchoolName
│  ├─ Domain (선택)
│  ├─ SpreadsheetID (학교 전용 시트)
│  └─ APIKey
├─ Config 시트 (전역 설정)
└─ ErrorLog 시트 (통합 로그)
```

### 2. 학교 생성 자동화

```javascript
/**
 * 새 학교 생성 (자동화)
 */
async function createNewSchool(schoolName, adminEmail) {
  // 1. 새 ID 생성
  const schoolId = generateSchoolId();
  
  // 2. 템플릿 시트 복사
  const templateId = 'TEMPLATE_SPREADSHEET_ID';
  const newSheet = DriveApp.getFileById(templateId)
    .makeCopy(`${schoolName} - 학습 데이터`);
  
  // 3. API 키 생성
  const apiKey = `sk_${schoolId}_${generateRandomString(32)}`;
  
  // 4. Master에 등록
  const masterSheet = getSchoolsSheet();
  masterSheet.appendRow([
    schoolId,
    schoolName,
    '',  // Domain (선택)
    newSheet.getId(),
    apiKey,
    JSON.stringify([adminEmail]),
    JSON.stringify(['3D_PRINTER']),
    'active',
    new Date(),
    new Date()
  ]);
  
  return {
    schoolId,
    spreadsheetId: newSheet.getId(),
    apiKey
  };
}
```

### 3. 데이터 조회 최적화

```javascript
/**
 * 학교별 캐싱으로 성능 최적화
 */
const schoolCache = CacheService.getScriptCache();

function getSchoolSpreadsheet(schoolId) {
  // 1. 캐시 확인
  const cacheKey = `sheet_${schoolId}`;
  const cachedId = schoolCache.get(cacheKey);
  
  if (cachedId) {
    return SpreadsheetApp.openById(cachedId);
  }
  
  // 2. Schools 시트에서 조회
  const schoolData = getSchoolData(schoolId);
  if (!schoolData) {
    throw new Error(`School not found: ${schoolId}`);
  }
  
  // 3. 캐시에 저장 (6시간)
  schoolCache.put(cacheKey, schoolData.SpreadsheetID, 21600);
  
  return SpreadsheetApp.openById(schoolData.SpreadsheetID);
}
```

---

## 💡 추가 권장사항

### 1. 하이브리드 접근

코드 기반 ID를 Primary Key로 사용하되, 도메인 정보도 저장:

```javascript
{
  id: "SCH001",           // Primary Key (불변)
  name: "서울고등학교",    // 변경 가능
  domain: "seoul-hs.kr",  // 참고용 (변경 가능)
  slug: "seoul-hs"        // URL 친화적 (선택)
}
```

### 2. 마이그레이션 경로

현재 단일 학교 → 다중 학교 전환 시:

```javascript
// 기존 데이터를 SCH001로 마이그레이션
const currentData = getCurrentData();
const sch001 = createNewSchool("현재 학교", "admin@school.com");

// 기존 데이터 복사
copyDataToSchool(currentData, sch001.spreadsheetId);
```

---

**최종 결론**: 
- ✅ **학교별 스프레드시트 분리**
- ✅ **코드 기반 식별자 (SCH001)**

이 조합이 장기적으로 가장 안정적이고 확장 가능합니다! 🚀
