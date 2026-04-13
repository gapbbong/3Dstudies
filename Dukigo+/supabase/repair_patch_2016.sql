-- Batch 3: 2016년 기출문제 데이터 복구 (53문항)
-- 스캔본(ElectricExam2016.pdf, 전기기능사) 대조

-- Round 1
UPDATE public.dukigo_exam_questions SET options = '["2", "4", "8", "16"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 1;
UPDATE public.dukigo_exam_questions SET options = '["(R_1 + R_2)I", "\\frac{R_2}{R_1 + R_2}I", "\\frac{R_1}{R_1 + R_2}I", "\\frac{R_1R_2}{R_1 + R_2}I"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 5;
UPDATE public.dukigo_exam_questions SET options = '["상자성체", "반자성체", "강자성체", "비자성체"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 7;
UPDATE public.dukigo_exam_questions SET options = '["\\frac{R}{R^2 + X_L^2}", "\\frac{X_L}{R^2 + X_L^2}", "-\\frac{R}{R^2 + X_L^2}", "-\\frac{X_L}{R^2 + X_L^2}"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 8;
UPDATE public.dukigo_exam_questions SET options = '["사인파", "고조파", "구형파", "삼각파"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 11;
UPDATE public.dukigo_exam_questions SET options = '["1.8", "2.2", "4.4", "6.3"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 13;
UPDATE public.dukigo_exam_questions SET options = '["키르히호프의 제1법칙", "키르히호프의 제2법칙", "플레밍의 오른손 법칙", "앙페르의 오른나사 법칙"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 14;
UPDATE public.dukigo_exam_questions SET options = '["4.88", "8.45", "14.63", "25.34"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 19;
UPDATE public.dukigo_exam_questions SET options = '["보안상", "미관상", "역률 증가", "감전 사고 방지"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 21;
UPDATE public.dukigo_exam_questions SET options = '["1", "5", "7", "12"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 22;
UPDATE public.dukigo_exam_questions SET options = '["\\frac{출력}{입력}", "\\frac{입력-손실}{출력}", "\\frac{출력}{출력+손실}", "\\frac{입력+손실}{입력}"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 26;
UPDATE public.dukigo_exam_questions SET options = '["Y종 - 90", "A종 - 105", "E종 - 120", "B종 - 130"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 28;
UPDATE public.dukigo_exam_questions SET options = '["3.42[%]", "4.56[%]", "5.56[%]", "6.64[%]"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 30;
UPDATE public.dukigo_exam_questions SET options = '["중성점을 이용할 수 있다.", "선간 전압이 상전압의 \\sqrt{3} 배가 된다.", "선간 전압에 제3고조파가 나타나지 않는다.", "같은 선간 전압의 결선에 비하여 절연이 어렵다."]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 32;
UPDATE public.dukigo_exam_questions SET options = '["차동 계전기", "방향 계전기", "온도 계전기", "접지 계전기"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 33;
UPDATE public.dukigo_exam_questions SET options = '["91", "61", "37", "19"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 56;
UPDATE public.dukigo_exam_questions SET options = '["0.6", "0.65", "0.7", "0.75"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 57;
UPDATE public.dukigo_exam_questions SET options = '["1.5", "2.5", "4", "6"]'::jsonb WHERE exam_year = 2016 AND exam_round = 1 AND question_no = 58;

-- Round 2
UPDATE public.dukigo_exam_questions SET options = '["F=9\\times 10^{-7}\\times\\frac{Q_1Q_2}{r^2}", "F=9\\times 10^{-9}\\times\\frac{Q_1Q_2}{r^2}", "F=9\\times 10^{9}\\times\\frac{Q_1Q_2}{r^2}", "F=9\\times 10^{10}\\times\\frac{Q_1Q_2}{r^2}"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 1;
UPDATE public.dukigo_exam_questions SET options = '["11", "22\\sqrt{3}", "22", "\\frac{22}{\\sqrt{3}}"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 4;
UPDATE public.dukigo_exam_questions SET options = '["전압의 제3고조파와 전류의 제3고조파 성분 사이에서 소비 전력이 발생한다.", "전압의 제2고조파와 전류의 제3고조파 성분 사이에서 소비 전력이 발생한다.", "전압의 제3고조파와 전류의 제5고조파 성분 사이에서 소비 전력이 발생한다.", "전압의 제5고조파와 전류의 제7고조파 성분 사이에서 소비 전력이 발생한다."]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 6;
UPDATE public.dukigo_exam_questions SET options = '["0.01", "0.02", "0.05", "0.1"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 7;
UPDATE public.dukigo_exam_questions SET options = '["3", "6", "16", "25"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 9;
UPDATE public.dukigo_exam_questions SET options = '["방전한다.", "반발한다.", "충전이 계속된다.", "반발과 흡인을 반복한다."]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 13;
UPDATE public.dukigo_exam_questions SET options = '["5.44", "6.08", "7.92", "9.84"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 14;
UPDATE public.dukigo_exam_questions SET options = '["0.06", "0.08", "0.6", "0.8"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 15;
UPDATE public.dukigo_exam_questions SET options = '["\\mu_s > 1", "\\mu_s \\gg 1", "\\mu_s = 1", "\\mu_s < 1"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 18;
UPDATE public.dukigo_exam_questions SET options = '["전력은 전력량과 다르다.", "전력량은 와트로 환산된다.", "전력량은 칼로리 단위로 환산된다.", "전력은 칼로리 단위로 환산할 수 없다."]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 19;
UPDATE public.dukigo_exam_questions SET options = '["유도 기전력의 크기가 같을 것", "동기 발전기의 용량이 같을 것", "유도 기전력의 위상이 같을 것", "유도 기전력의 주파수가 같을 것"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 22;
UPDATE public.dukigo_exam_questions SET options = '["리머", "오스터", "프레서 툴", "파이프 벤더"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 52;
UPDATE public.dukigo_exam_questions SET options = '["-", "-", "-", "-"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 53;
UPDATE public.dukigo_exam_questions SET options = '["1.2", "1.5", "1.8", "2.0"]'::jsonb WHERE exam_year = 2016 AND exam_round = 2 AND question_no = 54;

-- Round 3
UPDATE public.dukigo_exam_questions SET options = '["3배", "4배", "9배", "12배"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 13;
UPDATE public.dukigo_exam_questions SET options = '["엄지", "검지", "중지", "약지"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 14;
UPDATE public.dukigo_exam_questions SET options = '["\\frac{1}{3}", "\\frac{1}{9}", "\\frac{1}{27}", "\\frac{1}{81}"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 15;
UPDATE public.dukigo_exam_questions SET options = '["0.6", "0.7", "0.8", "0.9"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 18;
UPDATE public.dukigo_exam_questions SET options = '["1.5", "1.2", "4", "5"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 19;
UPDATE public.dukigo_exam_questions SET options = '["광속", "휘도", "조도", "광도"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 52;
UPDATE public.dukigo_exam_questions SET options = '["분전반", "배전반", "제어반", "개폐기"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 54;
UPDATE public.dukigo_exam_questions SET options = '["광도", "조도", "광속", "휘도"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 55;
UPDATE public.dukigo_exam_questions SET options = '["배전반", "개폐기", "접속기", "배선용 차단기"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 57;
UPDATE public.dukigo_exam_questions SET options = '["0.5", "1", "1.5", "2"]'::jsonb WHERE exam_year = 2016 AND exam_round = 3 AND question_no = 58;

-- Round 4
UPDATE public.dukigo_exam_questions SET options = '["1:1", "1:\\sqrt{2}", "1:2", "1:4"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 3;
UPDATE public.dukigo_exam_questions SET options = '["B = \\mu H", "B = \\frac{\\mu}{H}", "B = \\frac{H}{\\mu}", "B = \\frac{1}{\\mu H}"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 4;
UPDATE public.dukigo_exam_questions SET options = '["10", "30", "40", "60"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 5;
UPDATE public.dukigo_exam_questions SET options = '["240", "500", "750", "1000"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 9;
UPDATE public.dukigo_exam_questions SET options = '["삼각파", "구형파", "정현파", "반원파"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 15;
UPDATE public.dukigo_exam_questions SET options = '["LI", "\\frac{1}{2}LI", "LI^2", "\\frac{1}{2}LI^2"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 16;
UPDATE public.dukigo_exam_questions SET options = '["정류자", "브러시", "정류 권선", "보극"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 22;
UPDATE public.dukigo_exam_questions SET options = '["권선형 유도 전동기", "동기 전동기", "농형 유도 전동기", "직류 분권 전동기"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 23;
UPDATE public.dukigo_exam_questions SET options = '["비례한다.", "반비례한다.", "제곱에 비례한다.", "제곱에 반비례한다."]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 30;
UPDATE public.dukigo_exam_questions SET options = '["1:1", "1:2", "1:3", "3:1"]'::jsonb WHERE exam_year = 2016 AND exam_round = 4 AND question_no = 32;
