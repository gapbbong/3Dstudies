"use client";

import { useEffect, useState } from "react";

export function useAdaptiveStyle() {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    // 1. 디바이스의 픽셀 비율(DPI) 체크 
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    
    // 2. 하드웨어 스레딩(Core 수) 측정 (4코어 이하면 낡은 기기로 판명 확률 증가)
    const hardwareConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    
    // 3. 브라우저 배터리/데이터 절약 플래그 감지
    const isSaveData = typeof navigator !== 'undefined' && (navigator as any).connection?.saveData === true;
    
    // 종합 평가: 저성능 모바일 환경이나 배터리 세이버 환경일 경우
    if (hardwareConcurrency <= 2 || isSaveData || dpr < 1) {
      setIsLowPowerMode(true);
    }
  }, []);

  return { isLowPowerMode };
}
