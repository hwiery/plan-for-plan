import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prdService, apiUsageService } from '@/services/database';
import { AIPromptOptimizer, AIPromptFactory, AIPromptContext } from '@/lib/ai-prompt-optimizer';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { 
      projectId, 
      field, 
      promptType = 'implementation',
      targetModel = 'generic',
      includeDebugging = false,
      errorScenarios = []
    } = await req.json();

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    if (!field || !['frontend', 'backend', 'database', 'security', 'seo', 'publish'].includes(field)) {
      return NextResponse.json({ message: 'Valid field is required' }, { status: 400 });
    }

    // Get the PRD document
    const prdDocument = await prdService.findLatestByProjectId(projectId);
    if (!prdDocument || !prdDocument.content) {
      return NextResponse.json({ message: 'PRD document not found' }, { status: 404 });
    }

    const prdContent = prdDocument.content as Record<string, string>;
    const fieldContent = prdContent[field];

    if (!fieldContent) {
      return NextResponse.json({ message: `No content found for field: ${field}` }, { status: 404 });
    }

    // Extract project context from PRD content
    const context: AIPromptContext = {
      projectName: `Project ${projectId}`, // This could be extracted from project data
      projectType: extractProjectType(prdContent),
      techStack: extractTechStack(prdContent),
      complexity: extractComplexity(prdContent),
      dependencies: extractDependencies(prdContent),
      targetAudience: extractTargetAudience(prdContent)
    };

    let result: unknown;

    switch (promptType) {
      case 'implementation':
        result = AIPromptFactory.createImplementationPrompt(fieldContent, context, field);
        if (targetModel !== 'generic') {
          result = AIPromptOptimizer.generateModelSpecificPrompts(
            { field: field as 'frontend' | 'backend' | 'database' | 'security' | 'seo' | 'publish', content: fieldContent, priority: 'high' },
            context,
            targetModel as 'claude' | 'gpt4' | 'gemini' | 'generic'
          );
        }
        break;

      case 'step-by-step':
        const allSections = Object.entries(prdContent).map(([key, content]) => ({
          field: key,
          content: content as string
        }));
        result = AIPromptFactory.createProjectGuide(allSections, context);
        break;

      case 'debugging':
        result = AIPromptFactory.createDebuggingAssistant(field, context, errorScenarios);
        break;

      default:
        return NextResponse.json({ message: 'Invalid prompt type' }, { status: 400 });
    }

    // Track API usage
    const estimatedTokens = Math.ceil(JSON.stringify(result).length / 4);
    await apiUsageService.track({
      userId: user.id,
      endpoint: '/api/ai-prompts/generate',
      tokens: estimatedTokens,
      cost: 0,
    });

    return NextResponse.json({
      promptType,
      field,
      targetModel,
      context,
      result,
      metadata: {
        generatedAt: new Date().toISOString(),
        estimatedTokens,
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('AI prompt generation error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ 
      message: 'An unexpected error occurred during AI prompt generation' 
    }, { status: 500 });
  }
}

// Helper functions to extract context from PRD content
function extractProjectType(prdContent: Record<string, string>): string {
  const content = JSON.stringify(prdContent).toLowerCase();
  
  if (content.includes('e-commerce') || content.includes('ecommerce') || content.includes('shop')) {
    return 'E-commerce Platform';
  } else if (content.includes('saas') || content.includes('subscription') || content.includes('dashboard')) {
    return 'SaaS Application';
  } else if (content.includes('mobile') || content.includes('app store') || content.includes('android') || content.includes('ios')) {
    return 'Mobile Application';
  } else if (content.includes('blog') || content.includes('cms') || content.includes('content management')) {
    return 'Content Management System';
  } else if (content.includes('social') || content.includes('community') || content.includes('messaging')) {
    return 'Social Platform';
  } else if (content.includes('portfolio') || content.includes('personal') || content.includes('landing')) {
    return 'Portfolio/Landing Page';
  }
  
  return 'Web Application';
}

function extractTechStack(prdContent: Record<string, string>): string[] {
  const content = JSON.stringify(prdContent).toLowerCase();
  const techStack: string[] = [];
  
  // Frontend frameworks
  if (content.includes('react')) techStack.push('React');
  if (content.includes('vue')) techStack.push('Vue.js');
  if (content.includes('angular')) techStack.push('Angular');
  if (content.includes('svelte')) techStack.push('Svelte');
  if (content.includes('next.js') || content.includes('nextjs')) techStack.push('Next.js');
  
  // Backend frameworks
  if (content.includes('express')) techStack.push('Express.js');
  if (content.includes('fastapi')) techStack.push('FastAPI');
  if (content.includes('django')) techStack.push('Django');
  if (content.includes('flask')) techStack.push('Flask');
  if (content.includes('spring')) techStack.push('Spring Boot');
  
  // Databases
  if (content.includes('postgresql') || content.includes('postgres')) techStack.push('PostgreSQL');
  if (content.includes('mysql')) techStack.push('MySQL');
  if (content.includes('mongodb')) techStack.push('MongoDB');
  if (content.includes('redis')) techStack.push('Redis');
  
  // Default stack if nothing detected
  if (techStack.length === 0) {
    techStack.push('React', 'Node.js', 'PostgreSQL');
  }
  
  return [...new Set(techStack)];
}

function extractComplexity(prdContent: Record<string, string>): 'simple' | 'medium' | 'complex' {
  const content = JSON.stringify(prdContent);
  const indicators = {
    complex: ['microservices', 'scalability', 'high availability', 'load balancing', 'caching', 'queue', 'websocket'],
    medium: ['authentication', 'authorization', 'api', 'database', 'responsive', 'mobile'],
    simple: ['static', 'landing page', 'portfolio', 'basic']
  };
  
  const complexScore = indicators.complex.filter(term => 
    content.toLowerCase().includes(term)
  ).length;
  
  const mediumScore = indicators.medium.filter(term => 
    content.toLowerCase().includes(term)
  ).length;
  
  if (complexScore >= 2) return 'complex';
  if (mediumScore >= 3) return 'medium';
  return 'simple';
}

function extractDependencies(prdContent: Record<string, string>): string[] {
  const content = JSON.stringify(prdContent).toLowerCase();
  const dependencies: string[] = [];
  
  // Common dependencies based on content
  if (content.includes('authentication')) dependencies.push('jsonwebtoken', 'bcryptjs');
  if (content.includes('email')) dependencies.push('nodemailer');
  if (content.includes('file upload')) dependencies.push('multer', 'cloudinary');
  if (content.includes('payment')) dependencies.push('stripe');
  if (content.includes('websocket')) dependencies.push('socket.io');
  if (content.includes('validation')) dependencies.push('joi', 'yup');
  if (content.includes('testing')) dependencies.push('jest', 'cypress');
  
  return [...new Set(dependencies)];
}

function extractTargetAudience(prdContent: Record<string, string>): string {
  const content = JSON.stringify(prdContent).toLowerCase();
  
  if (content.includes('developer') || content.includes('programmer')) {
    return 'Developers and Technical Users';
  } else if (content.includes('business') || content.includes('enterprise')) {
    return 'Business Users and Enterprises';
  } else if (content.includes('consumer') || content.includes('general public')) {
    return 'General Consumers';
  } else if (content.includes('student') || content.includes('education')) {
    return 'Students and Educators';
  }
  
  return 'General Users';
}