'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

async function getPrdDocument(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/prd`);
  if (!res.ok) {
    // If the PRD is not found, it might not have been generated yet.
    // We can trigger the generation here.
    const generateRes = await fetch(`/api/prd/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
    });
    if (!generateRes.ok) {
        throw new Error('Failed to generate PRD document');
    }
    return generateRes.json();
  }
  return res.json();
}

const tabs = [
  { name: 'Frontend', key: 'frontend' },
  { name: 'Backend', key: 'backend' },
  { name: 'Database', key: 'database' },
  { name: 'Security', key: 'security' },
  { name: 'SEO', key: 'seo' },
  { name: 'Publish', key: 'publish' },
];

export default function PrdResultPage() {
  const [prdDocument, setPrdDocument] = useState(null);
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiPrompts, setAiPrompts] = useState(null);
  const [showAIPrompts, setShowAIPrompts] = useState(false);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        try {
          const data = await getPrdDocument(projectId);
          setPrdDocument(data);
        } catch (err) {
          setError('Failed to load PRD document.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId]);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    // Add a toast notification here in a real app
    alert('Copied to clipboard!');
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = tabs.map(tab => {
      return `# ${tab.name}\n\n${prdDocument.content[tab.key]}`;
    }).join('\n\n---\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prdDocument.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateAIPrompts = async () => {
    setPromptsLoading(true);
    try {
      const response = await fetch('/api/ai-prompts/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId,
          includeStepByStep: true,
          includeDebugging: true,
          targetModel: 'generic'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI prompts');
      }

      const data = await response.json();
      setAiPrompts(data);
      setShowAIPrompts(true);
    } catch (error) {
      console.error('Error generating AI prompts:', error);
      alert('Failed to generate AI prompts. Please try again.');
    } finally {
      setPromptsLoading(false);
    }
  };

  const handleCopyPrompt = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    alert(`${title} prompt copied to clipboard!`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Generating PRD...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!prdDocument) {
    return <div className="min-h-screen flex items-center justify-center">PRD document not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Product Requirements Document</h1>
        
        <div className="flex justify-between items-center mb-4">
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">Select a tab</label>
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                    onChange={(e) => setActiveTab(e.target.value)}
                    value={activeTab}
                >
                    {tabs.map((tab) => (
                        <option key={tab.key} value={tab.key}>{tab.name}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`${ 
                                    activeTab === tab.key
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="flex space-x-2">
                <button 
                    onClick={() => handleCopy(Object.values(prdDocument.content).join('\n\n'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Copy All
                </button>
                <button 
                    onClick={handleDownloadMarkdown}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Download as Markdown
                </button>
                <button 
                    onClick={() => handleGenerateAIPrompts()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Generate AI Prompts
                </button>
            </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md mt-4">
            <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
                    {prdDocument.content[activeTab]}
                </pre>
            </div>
            <button 
                onClick={() => handleCopy(prdDocument.content[activeTab])}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
                Copy Section
            </button>
        </div>

        {/* AI Implementation Prompts Section */}
        {showAIPrompts && aiPrompts && (
          <div className="bg-white p-8 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-6 text-purple-600">🤖 AI Implementation Prompts</h2>
            
            {/* Implementation Prompts for Each Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Field-Specific Implementation Prompts</h3>
              <div className="grid gap-4">
                {aiPrompts.implementationPrompts?.map((prompt, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg capitalize">{prompt.field}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prompt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          prompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prompt.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {prompt.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md mb-3">
                      <pre className="whitespace-pre-wrap text-sm">{prompt.implementationPrompt}</pre>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={() => handleCopyPrompt(prompt.implementationPrompt, prompt.title)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Copy Prompt
                      </button>
                      <div className="text-sm text-gray-500">
                        Dependencies: {prompt.dependencies?.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Implementation Guide */}
            {aiPrompts.stepByStepGuide && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Step-by-Step Implementation Guide</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Recommended Implementation Order:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {aiPrompts.stepByStepGuide.implementationOrder?.map((step, index) => (
                      <li key={index} className="capitalize">{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="space-y-4">
                  {aiPrompts.stepByStepGuide.stepByStepGuide?.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Step {step.step}: {step.task}</h4>
                        <button
                          onClick={() => handleCopyPrompt(step.prompt, `Step ${step.step}`)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Copy Step Prompt
                        </button>
                      </div>
                      {step.dependencies.length > 0 && (
                        <p className="text-sm text-gray-600 mb-2">
                          Dependencies: {step.dependencies.join(', ')}
                        </p>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Implementation Prompt
                        </summary>
                        <div className="bg-gray-50 p-3 rounded-md mt-2">
                          <pre className="whitespace-pre-wrap text-sm">{step.prompt}</pre>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architecture Overview */}
            {aiPrompts.architecturePrompt && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">System Architecture Prompt</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{aiPrompts.architecturePrompt.title}</h4>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {aiPrompts.architecturePrompt.estimatedTime}
                      </span>
                      <button
                        onClick={() => handleCopyPrompt(aiPrompts.architecturePrompt.prompt, 'Architecture')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Copy Architecture Prompt
                      </button>
                    </div>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
                      View Architecture Prompt
                    </summary>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm">{aiPrompts.architecturePrompt.prompt}</pre>
                    </div>
                  </details>
                  {aiPrompts.architecturePrompt.deliverables && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Expected Deliverables:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {aiPrompts.architecturePrompt.deliverables.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Integration Prompts */}
            {aiPrompts.integrationPrompts && aiPrompts.integrationPrompts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Integration Prompts</h3>
                <div className="space-y-4">
                  {aiPrompts.integrationPrompts.map((integration, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{integration.name}</h4>
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            {integration.estimatedTime}
                          </span>
                          <button
                            onClick={() => handleCopyPrompt(integration.prompt, integration.name)}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                          >
                            Copy Integration Prompt
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Sections: {integration.sections.join(', ')}
                      </p>
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Integration Prompt
                        </summary>
                        <div className="bg-gray-50 p-3 rounded-md mt-2">
                          <pre className="whitespace-pre-wrap text-sm">{integration.prompt}</pre>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => setShowAIPrompts(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hide AI Prompts
              </button>
            </div>
          </div>
        )}

        {/* Loading state for AI prompts */}
        {promptsLoading && (
          <div className="bg-white p-8 rounded-lg shadow-md mt-8 text-center">
            <div className="text-purple-600">Generating AI Implementation Prompts...</div>
          </div>
        )}
      </div>
    </div>
  );
}
