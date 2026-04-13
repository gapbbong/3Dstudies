-- Batch 1: 2015년 제1회 기출문제 데이터 복구 (16문항)
-- 스캔본(ElectricExam2015.pdf)을 대조하여 누락된 옵션 데이터 복원

UPDATE public.dukigo_exam_questions SET options = '["20", "20/\\sqrt{3}", "20\\sqrt{3}", "10\\sqrt{3}"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 4;
UPDATE public.dukigo_exam_questions SET options = '["0.5", "1.2", "2.8", "4.2"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 5;
UPDATE public.dukigo_exam_questions SET options = '["0.62", "1.44", "4.46", "6.24"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 6;
UPDATE public.dukigo_exam_questions SET options = '["5", "4", "3", "2"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 7;
UPDATE public.dukigo_exam_questions SET options = '["40", "50", "60", "80"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 8;
UPDATE public.dukigo_exam_questions SET options = '["19", "50", "80", "100"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 10;
UPDATE public.dukigo_exam_questions SET options = '["0.5", "1", "2", "5.8"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 18;
UPDATE public.dukigo_exam_questions SET options = '["3배", "4배", "6배", "9배"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 20;
UPDATE public.dukigo_exam_questions SET options = '["4", "3", "1", "0"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 37;
UPDATE public.dukigo_exam_questions SET options = '["1", "3", "6", "9"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 39;
UPDATE public.dukigo_exam_questions SET options = '["4", "5", "6", "8"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 41;
UPDATE public.dukigo_exam_questions SET options = '["1", "1.5", "2", "3"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 42;
UPDATE public.dukigo_exam_questions SET options = '["0.2", "0.5", "1", "1.2"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 43;
UPDATE public.dukigo_exam_questions SET options = '["3.5", "4.5", "5.5", "6.5"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 47;
UPDATE public.dukigo_exam_questions SET options = '["1.2", "1.5", "1.6", "1.8"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 48;
UPDATE public.dukigo_exam_questions SET options = '["0.8", "1.2", "1.5", "2.0"]'::jsonb WHERE exam_year = 2015 AND exam_round = 1 AND question_no = 50;
