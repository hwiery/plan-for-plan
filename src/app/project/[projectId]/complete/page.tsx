'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProjectCompletePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleStartNewProject = () => {
    router.push('/create');
  };

  const handleViewPRD = () => {
    router.push(`/project/${projectId}/result`);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, rating, comment: feedback }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-white p-10 rounded-lg shadow-xl text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-20 w-20 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-4">프로젝트 완료!</h1>
          <p className="text-xl text-gray-600 mt-2">성공적으로 PRD가 생성되었습니다.</p>
        </div>

        {/* Next Steps Guide */}
        <div className="mb-10 text-left">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">다음 단계</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><span className="font-semibold">PRD 확인:</span> 생성된 PRD를 확인하고 필요한 부분을 수정하거나 보완하세요.</li>
            <li><span className="font-semibold">개발 시작:</span> PRD를 기반으로 개발을 시작하거나 AI 개발 도구에 바로 적용해보세요.</li>
            <li><span className="font-semibold">피드백 제공:</span> 서비스 개선을 위해 소중한 피드백을 남겨주세요.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-10">
          <button
            onClick={handleViewPRD}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            PRD 확인하기
          </button>
          <button
            onClick={handleStartNewProject}
            className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors shadow-md"
          >
            새 프로젝트 시작
          </button>
        </div>

        {/* Feedback Form */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">피드백 남기기</h2>
          {feedbackSubmitted ? (
            <p className="text-green-600 text-lg">피드백 감사합니다!</p>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label htmlFor="rating" className="block text-left text-sm font-medium text-gray-700 mb-2">서비스 만족도</label>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-8 w-8 cursor-pointer ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      onClick={() => setRating(star)}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="feedback" className="block text-left text-sm font-medium text-gray-700 mb-2">의견</label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="서비스에 대한 의견을 자유롭게 남겨주세요."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmittingFeedback || rating === 0}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmittingFeedback ? '제출 중...' : '피드백 제출'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
