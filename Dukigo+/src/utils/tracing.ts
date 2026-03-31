/**
 * 트레이싱 및 정합성을 판단하기 위한 모듈
 * 1. 불필요한 공백 제거
 * 2. -- => →, .. => · 등 기호 자동 치환
 * 3. Levenshtein Distance (편집 거리 알고리즘) 적용
 */

export function sanitizeTracingText(input: string): string {
  if (!input) return "";
  let clean = input.replace(/\s+/g, ""); // 공백 무시 연산
  clean = clean.replace(/--/g, "→");     // 화살표 자동 치환
  clean = clean.replace(/\.\./g, "·");   // 가운뎃점 자동 치환
  return clean;
}

export function calculateLevenshtein(a: string, b: string): number {
  a = sanitizeTracingText(a);
  b = sanitizeTracingText(b);

  const matrix = [];
  let i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  let j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  const maxLen = Math.max(a.length, b.length);
  const distance = matrix[b.length][a.length];
  if (maxLen === 0) return 100;
  
  // 정확도를 0~100 사이의 퍼센티지로 환산 변환 계산
  const accuracy = ((maxLen - distance) / maxLen) * 100;
  return accuracy;
}
