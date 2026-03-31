import { createClient } from "@supabase/supabase-js";

// dukigo_plan.md 명세에 따른 ngrok 서버 주소 및 키 연동
// CORS 방지를 위해 브라우저 단에서는 Next.js Proxy(/supabase-api)를 경유
const isClient = typeof window !== 'undefined';
// KchapleCheck의 8000 포트 및 ngrok 연동 방식을 계승
const supabaseUrl = isClient ? window.location.origin + "/supabase-api" : "http://10.128.49.91:8000";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'ngrok-skip-browser-warning': 'true', 
    }
  }
});
