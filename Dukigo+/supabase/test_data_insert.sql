/**
 * [성공 보장 퀴즈 테스트 데이터]
 * - ID를 수동으로 입력하지 않아 UUID 형식 오류(22P02)를 방지합니다.
 */
INSERT INTO public.dukigo_exam_questions (subject_id, exam_year, exam_round, question_no, question_text, options, correct_answer)
VALUES 
('ELECTRICITY', 2015, 1, 1, '유효 전력의 식으로 옳은 것은? (단, E: 전압, I: 전류, θ: 위상각)', '["EI cos θ", "EI sin θ", "EI tan θ", "EI"]', '1'),
('ELECTRICITY', 2015, 1, 2, '물질에 따라 자석에 반발하는 물체를 무엇이라 하는가?', '["비자성체", "상자성체", "반자성체", "강자성체"]', '3'),
('ELECTRICITY', 2015, 1, 3, '도체를 전기 전도도가 좋은 순서대로 나열한 것은?', '["은 → 구리 → 금 → 알루미늄", "구리 → 금 → 은 → 알루미늄", "금 → 구리 → 알루미늄 → 은", "알루미늄 → 금 → 은 → 구리"]', '1'),
('ELECTRICITY', 2015, 1, 4, '저항이 10옴인 도체에 1A의 전류를 10분간 흘렸다면 발생하는 열량은 몇 kcal인가?', '["69", "4", "6", "6.24"]', '2');
