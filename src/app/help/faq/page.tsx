
export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">자주 묻는 질문 (FAQ)</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Q: PRD Generator는 무엇인가요?</h2>
          <p className="text-gray-700">
            A: PRD Generator는 한 줄 아이디어를 입력하면 AI가 체계적인 질문을 통해 아이디어를 구체화하고, 실제 개발 가능한 상세한 PRD(Product Requirements Document)를 자동으로 생성해주는 서비스입니다.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Q: 어떤 종류의 PRD를 생성할 수 있나요?</h2>
          <p className="text-gray-700">
            A: 프론트엔드, 백엔드, 데이터베이스, 보안, SEO, 퍼블리쉬 등 6개 분야에 걸쳐 상세한 PRD를 생성합니다. 각 분야별로 AI가 바로 구현할 수 있는 수준의 명세가 제공됩니다.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Q: 무료로 사용할 수 있나요?</h2>
          <p className="text-gray-700">
            A: 네, 일정량의 토큰을 무료로 제공하는 프리 플랜이 있습니다. 더 많은 사용량이나 고급 기능이 필요하시면 유료 플랜으로 업그레이드할 수 있습니다.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Q: 생성된 PRD는 어떻게 활용할 수 있나요?</h2>
          <p className="text-gray-700">
            A: 생성된 PRD는 복사-붙여넣기 형태로 제공되어 AI 개발 도구에 바로 입력하여 개발을 시작할 수 있습니다. 또한, PDF, Word, Markdown 형식으로 내보내기하여 팀원들과 공유하거나 문서화할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
