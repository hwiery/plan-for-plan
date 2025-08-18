'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const exampleIdeas = [
  '온라인 학습 플랫폼',
  '실시간 언어 번역 앱',
  'AI 기반 개인화 뉴스 피드',
  '피트니스 추적 및 소셜 앱',
  '중고 마켓플레이스',
];

export default function CreateProjectPage() {
  const [idea, setIdea] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleExampleClick = () => {
    const randomIndex = Math.floor(Math.random() * exampleIdeas.length);
    setIdea(exampleIdeas[randomIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!idea.trim()) {
      setError('아이디어를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: projectName, initialIdea: idea }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '프로젝트 생성에 실패했습니다.');
      }

      const newProject = await response.json();
      router.push(`/interview/${newProject.id}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">새 프로젝트 시작</h1>
        <p className="text-gray-600 mb-8">어떤 아이디어를 가지고 계신가요? 한 문장으로 간단하게 설명해주세요.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                프로젝트 이름 (선택사항)
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: AI 기반 작문 보조 도구"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="idea" className="block text-sm font-medium text-gray-700">
                아이디어
              </label>
              <textarea
                id="idea"
                name="idea"
                rows={4}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 사용자가 글을 쓰면 AI가 문법 및 스타일을 교정해주는 서비스"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleExampleClick}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                아이디어 예시 보기
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '생성 중...' : '인터뷰 시작하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
