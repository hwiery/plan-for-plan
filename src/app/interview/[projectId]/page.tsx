'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

async function getInterviewData(projectId: string) {
  const res = await fetch(`/api/interviews/${projectId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch interview data');
  }
  return res.json();
}

async function submitAnswer(projectId: string, questionIndex: number, answer: string) {
  const res = await fetch(`/api/interviews/${projectId}`,
  {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionIndex, answer }),
  });
  if (!res.ok) {
    throw new Error('Failed to submit answer');
  }
  return res.json();
}

async function generateNextQuestion(projectId: string) {
    const res = await fetch(`/api/questions/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
    });
    if (!res.ok) {
        throw new Error('Failed to generate next question');
    }
    return res.json();
}

export default function InterviewPage() {
  const [project, setProject] = useState(null);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        try {
          const data = await getInterviewData(projectId);
          setProject(data.project);
          setSession(data.session);
          const currentQuestion = data.session.questions[data.session.currentStep];
          const initialAnswer = data.session.answers[data.session.currentStep];
          if (currentQuestion?.type === 'checkbox' && initialAnswer) {
            setCurrentAnswer(Array.isArray(initialAnswer) ? initialAnswer : [initialAnswer]);
          } else {
            setCurrentAnswer(initialAnswer || '');
          }
        } catch (err) {
          setError('Failed to load interview data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId]);

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
        await submitAnswer(projectId, typeof session?.currentStep === 'number' ? session.currentStep : 0, currentAnswer);
        const { question, finished } = await generateNextQuestion(projectId);

        if(finished) {
            router.push(`/project/${projectId}/result`);
            return;
        }

        // Update session state with new question
        setSession(prev => prev ? ({
            ...prev,
            questions: [...(prev.questions || []), question],
            answers: [...((prev.answers || []).slice(0, prev.currentStep || 0)), currentAnswer],
            currentStep: (prev.currentStep || 0) + 1,
        }) : null);
        setCurrentAnswer((question as any)?.type === 'checkbox' ? [] : '');
    } catch (err) {
        setError('Failed to submit answer or generate next question.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handlePrev = () => {
    if (session && typeof session.currentStep === 'number' && session.currentStep > 0) {
        const prevStep = session.currentStep - 1;
        const prevQuestion = Array.isArray(session.questions) ? session.questions[prevStep] : null;
        const prevAnswer = Array.isArray(session.answers) ? session.answers[prevStep] : null;
        setSession(prev => prev ? ({
            ...prev,
            currentStep: prevStep,
        }) : null);
        if ((prevQuestion as any)?.type === 'checkbox' && prevAnswer) {
            setCurrentAnswer(Array.isArray(prevAnswer) ? prevAnswer : [prevAnswer]);
        } else {
            setCurrentAnswer(prevAnswer || '');
        }
    }
  };

  const renderInput = () => {
    const question = Array.isArray(session?.questions) && typeof session.currentStep === 'number' 
      ? session.questions[session.currentStep] 
      : null;
    if (!question) return null;

    switch ((question as any)?.type) {
      case 'select':
        return (
          <div className="space-y-2">
            {Array.isArray((question as any)?.options) && (question as any).options.map((option: string, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="answer"
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`option-${index}`} className="text-lg">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {Array.isArray((question as any)?.options) && (question as any).options.map((option: string, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`option-${index}`}
                  name={option}
                  checked={(currentAnswer as string[]).includes(option)}
                  onChange={(e) => {
                    const newAnswer = (currentAnswer as string[]).includes(option)
                      ? (currentAnswer as string[]).filter((item) => item !== option)
                      : [...(currentAnswer as string[]), option];
                    setCurrentAnswer(newAnswer);
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`option-${index}`} className="text-lg">{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <textarea
            rows={6}
            className="w-full p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
            placeholder="답변을 입력하세요..."
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
        );
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!project || !session) {
    return <div className="min-h-screen flex items-center justify-center">Interview not found.</div>;
  }

  const currentQuestion = session.questions[session.currentStep];
  const progress = Math.round(((session.currentStep) / (session.questions.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-white p-8 border-r">
          <h3 className="text-xl font-bold mb-4">아이디어 요약</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">최초 아이디어</h4>
              <p className="text-gray-600">{project?.initialIdea}</p>
            </div>
            <div>
              <h4 className="font-semibold">답변 요약</h4>
              <ul className="list-disc list-inside text-gray-600">
                {session?.answers.map((answer, index) => (
                  <li key={index}>{Array.isArray(answer) ? answer.join(', ') : answer}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-blue-700">진행률</span>
                    <span className="text-sm font-medium text-blue-700">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion?.text}</h2>
                {renderInput()}
            </div>

            <div className="mt-8 flex justify-between">
                <button 
                    onClick={handlePrev} 
                    disabled={session.currentStep === 0 || isSubmitting}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                    이전
                </button>
                <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? '답변 제출 중...' : '다음'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
