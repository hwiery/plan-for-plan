'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// This would typically be in a service file
async function getProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }
  return res.json();
}

async function deleteProject(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Failed to delete project');
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const loadProjects = async () => {
        try {
          const userProjects = await getProjects();
          setProjects(userProjects);
          setFilteredProjects(userProjects);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      loadProjects();
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    let result = projects;
    if (statusFilter !== 'all') {
      result = result.filter(p => (p as Record<string, unknown>).status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter((p: Record<string, unknown>) => 
        (typeof p.name === 'string' && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof p.initialIdea === 'string' && p.initialIdea.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setProjects(projects.filter(p => typeof p.id === 'string' && p.id !== projectId));
      } catch (error) {
        alert('Failed to delete project.');
      }
    }
  };

  if (isLoading || status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Projects
              </h1>
            </div>
            <a
              href="/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              New Project
            </a>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-0">
            <div className="flex space-x-4 mb-4">
                <input 
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded-md w-1/2"
                />
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredProjects.map((project, index) => (
                  <li key={typeof project.id === 'string' ? project.id : `project-${index}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {typeof project.name === 'string' ? project.name : 'Untitled Project'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {typeof project.initialIdea === 'string' ? project.initialIdea : ''}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {typeof project.updatedAt === 'string' ? new Date(project.updatedAt).toLocaleDateString('ko-KR') : ''}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : project.status === 'interviewing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {typeof project.status === 'string' ? project.status : 'Unknown'}
                          </span>
                          <a
                            href={typeof project.id === 'string' ? `/project/${project.id}/result` : '#'}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </a>
                          <button onClick={() => typeof project.id === 'string' && handleDelete(project.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </div>
    </div>
  );
}