"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface StudyConfig {
  PASS_THRESHOLD_ACCURACY: number;
  CRAM_THRESHOLD_ACCURACY: number;
  TEMP_WEIGHTS: { CORRECT: number; WRONG: number; STREAK_BONUS: number };
  IDLE_TIMEOUT: number;
  SUBJECT_TYPE: string[];
}

export interface SecurityConfig {
  MAX_TABS: number;
  SCREEN_PROTECTION_LEVEL: 'NONE' | 'BLUR' | 'LOCK' | 'LOGOUT';
}

export interface DukigoConfig {
  STUDY_CONFIG: StudyConfig;
  SECURITY_CONFIG: SecurityConfig;
}

interface ConfigStore {
  config: DukigoConfig | null;
  setConfig: (config: DukigoConfig) => void;
  isLoading: boolean;
  
  // 게임화(Gamification) 관련 전역 도파민 상태
  temp: number;
  setTemp: (t: number) => void;
  streak: number;
  setStreak: (s: number) => void;
}

const DEFAULT_CONFIG: DukigoConfig = {
  STUDY_CONFIG: {
    PASS_THRESHOLD_ACCURACY: 93,
    CRAM_THRESHOLD_ACCURACY: 96,
    TEMP_WEIGHTS: { CORRECT: 2.0, WRONG: -1.0, STREAK_BONUS: 0.5 },
    IDLE_TIMEOUT: 60,
    SUBJECT_TYPE: ["KEC", "Architecture", "3D_Print", "General_School"]
  },
  SECURITY_CONFIG: {
    MAX_TABS: 1,
    SCREEN_PROTECTION_LEVEL: 'BLUR'
  }
};

export const useConfigStore = create<ConfigStore>((set) => ({
  config: DEFAULT_CONFIG,
  setConfig: (config) => set({ config, isLoading: false }),
  isLoading: true,
  
  temp: 36.5, // 기본 온도 36.5로 설정
  setTemp: (t) => set({ temp: t }),
  streak: 0,
  setStreak: (s) => set({ streak: s }),
}));

export function useConfigSubscription() {
  const setConfig = useConfigStore((state) => state.setConfig);

  useEffect(() => {
    // 1. 초기값 가져오기
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('dukigo_global_configs')
          .select('config_json')
          .eq('school_id', 'DEFAULT_SCHOOL')
          .single();
        
        if (error) {
          console.warn("환경 설정 DB 연동 실패 (기본값 사용):", error.message);
          useConfigStore.setState({ config: DEFAULT_CONFIG, isLoading: false });
          return;
        }

        if (data?.config_json) {
          setConfig(data.config_json as DukigoConfig);
        } else {
          useConfigStore.setState({ config: DEFAULT_CONFIG, isLoading: false });
        }
      } catch (err) {
        console.warn("네트워크 지연으로 기본 설정 적용:", err);
        useConfigStore.setState({ config: DEFAULT_CONFIG, isLoading: false });
      }
    };
    fetchConfig();

    // 2. Realtime 구독 설정
    const channel = supabase
      .channel('public:dukigo_global_configs')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dukigo_global_configs',
        },
        (payload) => {
          if (payload.new.config_json) {
             setConfig(payload.new.config_json as DukigoConfig);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setConfig]);
}
