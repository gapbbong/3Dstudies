"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useConfigStore } from "./useConfig";

export function useHeartbeat(userId?: string) {
  const config = useConfigStore((state) => state.config);
  const [isBlurred, setIsBlurred] = useState(false);
  const IDLE_TIMEOUT = config?.STUDY_CONFIG.IDLE_TIMEOUT || 60;

  useEffect(() => {
    if (!userId) return;

    // 고유한 탭 아이디 (새로고침 시에도 동일하게 유지하려면 sessionStorage 활용)
    const storedTabId = sessionStorage.getItem("dukigo_tab_id");
    const tabId = storedTabId || Math.random().toString(36).substring(2, 15);
    if (!storedTabId) sessionStorage.setItem("dukigo_tab_id", tabId);

    // 액티브 탭 localStorage 갱신
    localStorage.setItem("dukigo_active_tab", tabId);
    
    let lastActive = Date.now();

    // 동시 탭 방지 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dukigo_active_tab" && e.newValue !== tabId) {
        console.warn("다른 탭에서 접속이 감지되었습니다. (보안 가드)");
        setIsBlurred(true);
        // 침입 감지 시 서버에 강제 로깅 호출
        supabase.rpc("dukigo_heartbeat_sync", { p_user_id: userId, p_tab_id: "MULTIPLE_TABS_DETECTED" });
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 무반응 감지를 위한 사용자 액션 수집
    const resetIdle = () => { lastActive = Date.now(); };
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("touchstart", resetIdle);

    const interval = setInterval(() => {
      const now = Date.now();
      
      // 혹시 로컬스토리지가 풀렸을 때 재점유 (탭 경쟁)
      localStorage.setItem("dukigo_active_tab", tabId);

      // 무반응(Idle) 체크 - 시각적 펄스 알림
      if (now - lastActive > IDLE_TIMEOUT * 1000) {
        document.body.classList.add("idle-warning-flash");
      } else {
        document.body.classList.remove("idle-warning-flash");
      }
      
      // 주기적 서버 동기화 로깅 (10초에 한번씩 보냄)
      if (now % 10000 < 1000) {
         supabase.rpc("dukigo_heartbeat_sync", { p_user_id: userId, p_tab_id: tabId });
      }

    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, [userId, IDLE_TIMEOUT]);

  return { isBlurred };
}

