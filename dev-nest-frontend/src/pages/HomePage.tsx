import FeatureCard from '../components/FeatureCard'
import ViewContainer from '../components/ViewContainer'

const featureItems = [
  {
    title: '커뮤니티 빌드업',
    description:
      '개발자 네트워크를 확장하고 서로의 경험을 공유하기 위한 공간을 만듭니다.',
  },
  {
    title: '생산성 중심 워크플로',
    description:
      '직관적인 에디터와 마크다운 지원으로 작성부터 배포까지 빠르게 진행합니다.',
  },
  {
    title: '맞춤형 탐색',
    description:
      '해시태그와 검색 기능으로 원하는 주제의 글을 손쉽게 찾을 수 있습니다.',
  },
]

const HomePage = () => {
  return (
    <ViewContainer as="main" className="flex flex-col gap-12 py-16">
      <section className="flex flex-col gap-6 text-white">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Welcome to
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">DevNest</h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            개발자들이 기술과 경험을 공유하는 블로그 플랫폼입니다. 회원가입 후
            나만의 인사이트를 기록하고, 다양한 태그로 최신 트렌드를 탐색해
            보세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#signup"
            className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
          >
            지금 시작하기
          </a>
          <a
            href="#learn-more"
            className="rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            기능 살펴보기
          </a>
        </div>
      </section>
      <section
        id="learn-more"
        className="grid gap-6 sm:grid-cols-3"
        aria-label="플랫폼 핵심 기능"
      >
        {featureItems.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>
    </ViewContainer>
  )
}

export default HomePage
