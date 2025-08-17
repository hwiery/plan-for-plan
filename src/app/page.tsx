export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            한 줄 아이디어를
            <br />
            <span className="text-blue-600">실제 서비스로</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            간단한 아이디어를 체계적인 질문을 통해 구체화하고,
            <br />
            실제 개발 가능한 PRD를 생성하는 서비스입니다.
          </p>
          <a
            href="/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            무료로 시작하기
          </a>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">아이디어 입력</h3>
            <p className="text-gray-600">
              &quot;비행기표 예약 서비스&quot;처럼 간단한 한 줄로 아이디어를
              입력하세요.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">질문 답변</h3>
            <p className="text-gray-600">
              AI가 생성하는 체계적인 질문에 답변하여 아이디어를 구체화하세요.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">PRD 생성</h3>
            <p className="text-gray-600">
              실제 개발에 활용할 수 있는 상세한 PRD를 자동으로 생성받으세요.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            왜 PRD Generator인가요?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">🎯 체계적인 접근</h3>
              <p className="text-gray-600">
                전문가 수준의 질문을 통해 놓치기 쉬운 중요한 요소들을 모두
                고려합니다.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">🚀 즉시 구현 가능</h3>
              <p className="text-gray-600">
                생성된 PRD를 AI에게 전달하면 바로 개발을 시작할 수 있습니다.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">💡 6개 분야 커버</h3>
              <p className="text-gray-600">
                프론트엔드부터 배포까지 모든 개발 영역을 포괄적으로 다룹니다.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-3">⚡ 빠른 결과</h3>
              <p className="text-gray-600">
                10-15분 만에 완성도 높은 PRD를 생성할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
