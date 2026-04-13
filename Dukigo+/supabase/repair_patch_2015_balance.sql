-- Batch 2: 2015년 제2, 4, 5회 기출문제 데이터 복구
-- 스캔본(ElectricExam2015.pdf, 전기기능사) 대조

-- Round 2
UPDATE public.dukigo_exam_questions SET options = '["20[W]", "400[W]", "2.5[kW]", "10[kW]"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 4;
UPDATE public.dukigo_exam_questions SET options = '["\\sqrt{2} \\sin \\omega t", "2\\sqrt{2} \\sin \\omega t", "5\\sqrt{2} \\sin \\omega t", "10\\sqrt{2} \\sin \\omega t"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 11;
UPDATE public.dukigo_exam_questions SET options = '["10[A]", "14.1[A]", "20[A]", "28.2[A]"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 16;
UPDATE public.dukigo_exam_questions SET options = '["99", "198", "257.4", "297"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 28;
UPDATE public.dukigo_exam_questions SET options = '["300", "400", "500", "700"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 30;
UPDATE public.dukigo_exam_questions SET options = '["부하측", "고압측", "전원측", "저압측"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 36;
UPDATE public.dukigo_exam_questions SET options = '["0.8", "1.1", "1.25", "3"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 53;
UPDATE public.dukigo_exam_questions SET options = '["금속관 공사 또는 케이블 공사", "가요 전선관 공사", "목재 몰드 공사", "합성 수지 몰드 공사"]'::jsonb WHERE exam_year = 2015 AND exam_round = 2 AND question_no = 60;

-- Round 4
UPDATE public.dukigo_exam_questions SET options = '["W = 1/2 CV^2", "W = 1/2 CV", "W = 1/2 C^2V", "W = 2CV^2"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 2;
UPDATE public.dukigo_exam_questions SET options = '["V_l = V_p", "V_l = \\sqrt{3} V_p", "V_l = \\sqrt{2} V_p", "V_l = 1/\\sqrt{3} V_p"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 5;
UPDATE public.dukigo_exam_questions SET options = '["0.73", "7.3", "73", "730"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 7;
UPDATE public.dukigo_exam_questions SET options = '["3.0", "4.8", "6.0", "8.2"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 11;
UPDATE public.dukigo_exam_questions SET options = '["1[J/C]", "1[Wb/m]", "1[Ω/m]", "1[A·sec]"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 12;
UPDATE public.dukigo_exam_questions SET options = '["50", "75", "100", "150"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 15;
UPDATE public.dukigo_exam_questions SET options = '["실수부와 허수부로 구성된다.", "허수를 제곱하면 음수가 된다.", "복소수는 A = a + jb의 형태로 표시된다.", "거리와 방향을 나타내는 스칼라량으로 표시된다."]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 16;
UPDATE public.dukigo_exam_questions SET options = '["\\theta = \\tan^{-1} R/\\omega L", "\\theta = \\tan^{-1} \\omega L/R", "\\theta = \\tan^{-1} 1/R\\omega L", "\\theta = \\tan^{-1} R/\\sqrt{R^2 + (\\omega L)^2}"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 19;
UPDATE public.dukigo_exam_questions SET options = '["450", "550", "650", "750"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 23;
UPDATE public.dukigo_exam_questions SET options = '["2배가 된다.", "1배가 된다.", "1/2로 줄어든다.", "1/4로 줄어든다."]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 26;
UPDATE public.dukigo_exam_questions SET options = '["(ㄱ) N, (ㄴ) S, (ㄷ) +, (ㄹ) -", "(ㄱ) N, (ㄴ) S, (ㄷ) -, (ㄹ) +", "(ㄱ) S, (ㄴ) N, (ㄷ) +, (ㄹ) -", "(ㄱ) S, (ㄴ) N, (ㄷ) -, (ㄹ) +"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 30;
UPDATE public.dukigo_exam_questions SET options = '["6", "8", "12", "14"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 39;
UPDATE public.dukigo_exam_questions SET options = '["30^\\circ", "45^\\circ", "60^\\circ", "90^\\circ"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 40;
UPDATE public.dukigo_exam_questions SET options = '["50", "110", "150", "220"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 42;
UPDATE public.dukigo_exam_questions SET options = '["3", "4", "6", "10"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 46;
UPDATE public.dukigo_exam_questions SET options = '["35", "50", "75", "100"]'::jsonb WHERE exam_year = 2015 AND exam_round = 4 AND question_no = 47;

-- Round 5
UPDATE public.dukigo_exam_questions SET options = '["2", "3", "4", "8"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 1;
UPDATE public.dukigo_exam_questions SET options = '["430", "520", "610", "860"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 4;
UPDATE public.dukigo_exam_questions SET options = '["10", "30", "25", "30"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 6;
UPDATE public.dukigo_exam_questions SET options = '["2", "4", "6", "8"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 7;
UPDATE public.dukigo_exam_questions SET options = '["70.7", "86.7", "141.4", "282.8"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 8;
UPDATE public.dukigo_exam_questions SET options = '["1.52", "2.4", "24", "152"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 11;
UPDATE public.dukigo_exam_questions SET options = '["6", "8", "10", "12"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 12;
UPDATE public.dukigo_exam_questions SET options = '["100", "150", "173", "195"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 17;
UPDATE public.dukigo_exam_questions SET options = '["30도", "45도", "60도", "90도"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 20;
UPDATE public.dukigo_exam_questions SET options = '["90", "100", "110", "120"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 21;
UPDATE public.dukigo_exam_questions SET options = '["30.5", "50.5", "60.5", "80.5"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 25;
UPDATE public.dukigo_exam_questions SET options = '["0.4", "0.5", "1.9", "2.0"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 37;
UPDATE public.dukigo_exam_questions SET options = '["1.16", "2.16", "3.16", "4.16"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 41;
UPDATE public.dukigo_exam_questions SET options = '["14", "16", "18", "22"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 50;
UPDATE public.dukigo_exam_questions SET options = '["10", "15", "17", "24"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 51;
UPDATE public.dukigo_exam_questions SET options = '["0.6", "1.0", "1.2", "1.5"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 53;
UPDATE public.dukigo_exam_questions SET options = '["2.5", "3.0", "1.7", "2.4"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 55;
UPDATE public.dukigo_exam_questions SET options = '["2", "3", "5", "6"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 56;
UPDATE public.dukigo_exam_questions SET options = '["10", "8.5", "7.5", "6.5"]'::jsonb WHERE exam_year = 2015 AND exam_round = 5 AND question_no = 60;
