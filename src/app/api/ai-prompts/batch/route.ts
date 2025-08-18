import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prdService, apiUsageService } from '@/services/database';
import { AIPromptOptimizer, AIPromptContext, PRDSection } from '@/lib/ai-prompt-optimizer';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { 
      projectId,
      targetModel = 'generic',
      includeStepByStep = true,
      includeDebugging = false,
      priorityFields = [],
      customContext = {}
    } = await req.json();

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    // Get the PRD document
    const prdDocument = await prdService.findLatestByProjectId(projectId);
    if (!prdDocument || !prdDocument.content) {
      return NextResponse.json({ message: 'PRD document not found' }, { status: 404 });
    }

    const prdContent = prdDocument.content as Record<string, string>;
    
    // Extract project context
    const context: AIPromptContext = {
      projectName: `Project ${projectId}`,
      projectType: extractProjectType(prdContent),
      techStack: extractTechStack(prdContent),
      complexity: extractComplexity(prdContent),
      dependencies: extractDependencies(prdContent),
      targetAudience: extractTargetAudience(prdContent),
      ...customContext
    };

    // Generate prompts for all sections
    const fields = ['frontend', 'backend', 'database', 'security', 'seo', 'publish'];
    const sections: PRDSection[] = fields.map(field => ({
      field: field as 'frontend' | 'backend' | 'database' | 'security' | 'seo' | 'publish',
      content: prdContent[field] || '',
      priority: priorityFields.includes(field) ? 'high' as const : 'medium' as const
    })).filter(section => section.content.trim() !== '');

    // Generate implementation prompts for each section
    const implementationPrompts = await Promise.all(
      sections.map(async (section) => {
        const prompt = AIPromptOptimizer.generateImplementationPrompt(section, context);
        
        // Apply model-specific optimizations if requested
        if (targetModel !== 'generic') {
          return {
            field: section.field,
            ...AIPromptOptimizer.generateModelSpecificPrompts(
              section, 
              context, 
              targetModel as 'claude' | 'gpt4' | 'gemini' | 'generic'
            )
          };
        }
        
        return {
          field: section.field,
          ...prompt
        };
      })
    );

    // Generate step-by-step implementation guide
    let stepByStepGuide = null;
    if (includeStepByStep) {
      stepByStepGuide = AIPromptOptimizer.generateStepByStepGuide(sections, context);
    }

    // Generate debugging prompts for each section
    let debuggingPrompts = null;
    if (includeDebugging) {
      debuggingPrompts = await Promise.all(
        sections.map(section => ({
          field: section.field,
          ...AIPromptOptimizer.generateDebuggingPrompts(section, context, [])
        }))
      );
    }

    // Generate integration prompts between sections
    const integrationPrompts = generateIntegrationPrompts(sections, context);

    // Generate project overview and architecture prompt
    const architecturePrompt = generateArchitecturePrompt(sections, context);

    // Track API usage
    const result = {
      context,
      implementationPrompts,
      stepByStepGuide,
      debuggingPrompts,
      integrationPrompts,
      architecturePrompt,
      metadata: {
        generatedAt: new Date().toISOString(),
        targetModel,
        sectionsProcessed: sections.length,
        version: '1.0.0'
      }
    };

    const estimatedTokens = Math.ceil(JSON.stringify(result).length / 4);
    await apiUsageService.track({
      userId: user.id,
      endpoint: '/api/ai-prompts/batch',
      tokens: estimatedTokens,
      cost: 0,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Batch AI prompt generation error:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ 
      message: 'An unexpected error occurred during batch AI prompt generation' 
    }, { status: 500 });
  }
}

function generateIntegrationPrompts(sections: PRDSection[], context: AIPromptContext) {
  const integrations = [
    {
      name: 'Frontend-Backend Integration',
      sections: ['frontend', 'backend'],
      prompt: `You need to integrate the frontend and backend for ${context.projectName}. 

Focus on:
1. API endpoint integration and error handling
2. Authentication flow between frontend and backend
3. State management for API data
4. Real-time updates if needed (WebSocket/SSE)
5. File upload and download handling
6. Proper loading states and user feedback

Tech Stack: ${context.techStack.join(', ')}

Provide specific code examples for:
- API service layer in frontend
- Error handling and retry logic
- Authentication token management
- Data transformation between frontend and backend`
    },
    {
      name: 'Backend-Database Integration',
      sections: ['backend', 'database'],
      prompt: `You need to integrate the backend with the database for ${context.projectName}.

Focus on:
1. Database connection and pooling
2. ORM/Query builder setup and configuration
3. Migration and seeding strategies
4. Query optimization and indexing
5. Transaction handling for complex operations
6. Database backup and recovery procedures

Tech Stack: ${context.techStack.join(', ')}

Provide specific code examples for:
- Database connection setup
- Model definitions and relationships
- Migration scripts
- Seeding data
- Complex queries with joins and aggregations`
    },
    {
      name: 'Security Integration',
      sections: ['security', 'backend', 'frontend'],
      prompt: `You need to implement comprehensive security across all layers for ${context.projectName}.

Focus on:
1. End-to-end authentication and authorization
2. Security middleware and request validation
3. HTTPS and secure communication
4. Input sanitization and output encoding
5. CSRF and XSS protection
6. Rate limiting and DDoS protection

Tech Stack: ${context.techStack.join(', ')}

Provide specific code examples for:
- Authentication middleware
- JWT token handling
- Input validation schemas
- Security headers configuration
- Rate limiting implementation`
    }
  ];

  return integrations
    .filter(integration => 
      integration.sections.every(section => 
        sections.some(s => s.field === section)
      )
    )
    .map(integration => ({
      name: integration.name,
      sections: integration.sections,
      prompt: integration.prompt,
      complexity: context.complexity,
      estimatedTime: getIntegrationTime(integration.sections.length, context.complexity)
    }));
}

function generateArchitecturePrompt(sections: PRDSection[], context: AIPromptContext) {
  const availableSections = sections.map(s => s.field).join(', ');
  
  return {
    title: `System Architecture for ${context.projectName}`,
    prompt: `You are designing the complete system architecture for ${context.projectName}.

Project Context:
- Type: ${context.projectType}
- Tech Stack: ${context.techStack.join(', ')}
- Complexity: ${context.complexity}
- Target Audience: ${context.targetAudience}
- Available Sections: ${availableSections}

Generate a comprehensive architecture document that includes:

1. **System Overview**
   - High-level architecture diagram description
   - Component relationships and data flow
   - Technology stack justification

2. **Infrastructure Architecture**
   - Server and hosting setup
   - Database architecture and scaling strategy
   - CDN and caching layers
   - Monitoring and logging setup

3. **Application Architecture**
   - Frontend architecture and component structure
   - Backend API design and service layers
   - Database schema and relationships
   - Security layer implementation

4. **Development Workflow**
   - Local development setup
   - CI/CD pipeline configuration
   - Testing strategy across all layers
   - Deployment and rollback procedures

5. **Scalability Considerations**
   - Performance optimization strategies
   - Horizontal and vertical scaling plans
   - Caching and load balancing
   - Database optimization and sharding

6. **Security Architecture**
   - Authentication and authorization flow
   - Data encryption and protection
   - Network security and firewalls
   - Compliance and audit requirements

Provide specific recommendations for each section and explain the reasoning behind architectural decisions.`,
    complexity: context.complexity,
    estimatedTime: getArchitectureTime(sections.length, context.complexity),
    deliverables: [
      'Architecture diagrams and documentation',
      'Technology stack setup guides',
      'Development workflow documentation',
      'Security implementation checklist',
      'Performance optimization guidelines'
    ]
  };
}

function getIntegrationTime(numSections: number, complexity: 'simple' | 'medium' | 'complex'): string {
  const baseHours = numSections * 4;
  const multiplier = { simple: 1, medium: 1.5, complex: 2.5 }[complexity];
  const hours = Math.ceil(baseHours * multiplier);
  const days = Math.ceil(hours / 8);
  
  return `${hours} hours (${days} day${days > 1 ? 's' : ''})`;
}

function getArchitectureTime(numSections: number, complexity: 'simple' | 'medium' | 'complex'): string {
  const baseHours = Math.max(8, numSections * 2);
  const multiplier = { simple: 1.2, medium: 1.8, complex: 3 }[complexity];
  const hours = Math.ceil(baseHours * multiplier);
  const days = Math.ceil(hours / 8);
  
  return `${hours} hours (${days} day${days > 1 ? 's' : ''})`;
}

// Helper functions (same as in the other file)
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