'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle, Info, MessageSquare, LayoutDashboard, Trophy, GraduationCap } from 'lucide-react';

export default function GuidePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>로그인 화면으로 돌아가기</span>
                </button>

                {/* Header */}
                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                        <Info size={14} /> Teachers Guide
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        3D 프린터 스터디 <br />
                        <span className="text-blue-500">선생님 안내 페이지</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        중학생 동생들도 10분이면 적응하는 <br />
                        가장 쉬운 3D 프린터 자격증 학습 도우미입니다.
                    </p>
                </header>

                {/* Features Content */}
                <section className="grid gap-6">
                    <FeatureCard
                        icon={<BookOpen className="text-blue-400" />}
                        title="눈에 쏙 들어오는 이론 공부"
                        description="어려운 용어도 하나씩 따라 쓰다 보면 어느새 머릿속에 쏙쏙! 지루한 암기가 즐거운 게임처럼 바뀝니다."
                    />
                    <FeatureCard
                        icon={<CheckCircle className="text-emerald-400" />}
                        title="실수해도 괜찮아요, 오답 복습"
                        description="틀린 문제는 나중에 다시 모아서 풀 수 있어요. 자격증 합격 확률을 쑥쑥 높여줍니다."
                    />
                    <FeatureCard
                        icon={<MessageSquare className="text-purple-400" />}
                        title="모르는 건 바로 물어보세요"
                        description="AI 선생님이 옆에서 친절하게 설명해줘요. 질문하기 버튼 하나면 궁금증 해결!"
                    />
                    <FeatureCard
                        icon={<LayoutDashboard className="text-amber-400" size={24} />}
                        title="단원별 기출문제 뽀개기"
                        description="여러 해의 기출문제를 단원별로 분류했어요. 비슷한 유형을 모아 풀며 핵심을 파고듭니다."
                    />
                    <FeatureCard
                        icon={<Trophy className="text-yellow-400" size={24} />}
                        title="나만을 위한 맞춤 오답노트"
                        description="비슷한 문제를 계속 틀린다면? 자주 틀리는 문제를 자동으로 분석해 나만의 약점을 극복합니다."
                    />
                    <FeatureCard
                        icon={<GraduationCap className="text-rose-400" size={24} />}
                        title="다양한 이론 습득 방식"
                        description="단순 암기는 이제 그만! 따라 쓰기부터 액티브 리콜까지, 나에게 맞는 방식으로 이론을 정복하세요."
                    />
                </section>

                {/* Purchase Info */}
                <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
                    <h2 className="text-2xl font-bold">우리 학교에서도 쓰고 싶으신가요?</h2>
                    <p className="text-slate-400">
                        학교나 학원에서 사용하고 싶으신 선생님들은 아래 연락처로 문의해주세요. <br />
                        학교 맞춤형 학급 설정과 학생 전용 관리 화면을 제공해드립니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <a
                            href="mailto:serv@kakao.com"
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            이메일로 문의하기
                        </a>
                        <div className="px-6 py-4 bg-slate-800 text-slate-300 rounded-2xl font-mono text-center flex items-center justify-center">
                            kakao: serv1
                        </div>
                    </div>
                </section>

                <footer className="text-center text-slate-600 text-sm pb-12">
                    © 2026 3D Printer Study. Designed for effective learning.
                </footer>
            </div>
        </main>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-6 p-6 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="shrink-0 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">{description}</p>
            </div>
        </div>
    );
}
