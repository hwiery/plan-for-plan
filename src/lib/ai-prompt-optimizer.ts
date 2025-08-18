/**
 * AI Implementation Prompt Optimization System
 * 
 * This system generates optimized prompts for AI implementation based on PRD content.
 * It transforms PRD specifications into actionable, implementation-focused prompts.
 */

export interface AIPromptContext {
  projectName: string;
  projectType: string;
  techStack: string[];
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
  targetAudience: string;
}

export interface OptimizedPrompt {
  title: string;
  implementationPrompt: string;
  codeExamples: string[];
  testingGuidance: string;
  dependencies: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  followUpTasks: string[];
}

export interface PRDSection {
  field: 'frontend' | 'backend' | 'database' | 'security' | 'seo' | 'publish';
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export class AIPromptOptimizer {
  /**
   * Generate optimized implementation prompts for a specific PRD section
   */
  static generateImplementationPrompt(
    section: PRDSection, 
    context: AIPromptContext
  ): OptimizedPrompt {
    const basePrompt = this.getBasePromptTemplate(section.field);
    const optimizedPrompt = this.optimizeForImplementation(basePrompt, section, context);
    
    return {
      title: this.generateTitle(section.field, context.projectName),
      implementationPrompt: optimizedPrompt,
      codeExamples: this.generateCodeExamples(section.field, context),
      testingGuidance: this.generateTestingGuidance(section.field, context),
      dependencies: this.extractDependencies(section.content, context),
      estimatedTime: this.estimateImplementationTime(section, context),
      difficulty: this.assessDifficulty(section, context),
      followUpTasks: this.generateFollowUpTasks(section.field, context)
    };
  }

  /**
   * Generate step-by-step implementation guide
   */
  static generateStepByStepGuide(
    sections: PRDSection[], 
    context: AIPromptContext
  ): {
    implementationOrder: string[];
    stepByStepGuide: {
      step: number;
      section: string;
      task: string;
      prompt: string;
      dependencies: string[];
      verification: string;
    }[];
  } {
    const orderedSections = this.orderImplementationSteps(sections);
    const guide = orderedSections.map((section, index) => ({
      step: index + 1,
      section: section.field,
      task: this.generateTaskDescription(section.field, context),
      prompt: this.generateImplementationPrompt(section, context).implementationPrompt,
      dependencies: this.getDependenciesForStep(section, orderedSections.slice(0, index)),
      verification: this.generateVerificationSteps(section.field, context)
    }));

    return {
      implementationOrder: orderedSections.map(s => s.field),
      stepByStepGuide: guide
    };
  }

  /**
   * Generate context-aware prompts for specific AI models
   */
  static generateModelSpecificPrompts(
    section: PRDSection,
    context: AIPromptContext,
    targetModel: 'claude' | 'gpt4' | 'gemini' | 'generic'
  ): OptimizedPrompt {
    const basePrompt = this.generateImplementationPrompt(section, context);
    
    switch (targetModel) {
      case 'claude':
        return this.optimizeForClaude(basePrompt, section, context);
      case 'gpt4':
        return this.optimizeForGPT4(basePrompt, section, context);
      case 'gemini':
        return this.optimizeForGemini(basePrompt, section, context);
      default:
        return basePrompt;
    }
  }

  /**
   * Generate debugging and troubleshooting prompts
   */
  static generateDebuggingPrompts(
    section: PRDSection,
    context: AIPromptContext,
    errorScenarios: string[]
  ): {
    commonIssues: { issue: string; solution: string; prompt: string }[];
    debuggingSteps: string[];
    troubleshootingPrompt: string;
  } {
    return {
      commonIssues: this.getCommonIssues(section.field).map(issue => ({
        issue: issue.name,
        solution: issue.solution,
        prompt: this.generateDebuggingPrompt(issue, section, context)
      })),
      debuggingSteps: this.getDebuggingSteps(section.field),
      troubleshootingPrompt: this.generateTroubleshootingPrompt(section, context, errorScenarios)
    };
  }

  // Private helper methods

  private static getBasePromptTemplate(field: string): string {
    const templates = {
      frontend: `You are implementing the frontend for {projectName}. Focus on creating clean, maintainable, and user-friendly code. Follow modern React/Vue/Angular best practices.`,
      backend: `You are implementing the backend API for {projectName}. Focus on scalable architecture, proper error handling, and secure endpoints.`,
      database: `You are designing and implementing the database schema for {projectName}. Focus on data integrity, performance, and scalability.`,
      security: `You are implementing security measures for {projectName}. Focus on authentication, authorization, data protection, and vulnerability prevention.`,
      seo: `You are implementing SEO optimizations for {projectName}. Focus on technical SEO, performance, and search engine visibility.`,
      publish: `You are setting up deployment and publishing for {projectName}. Focus on automated deployment, monitoring, and production readiness.`
    };
    
    return templates[field as keyof typeof templates] || templates.frontend;
  }

  private static optimizeForImplementation(
    basePrompt: string, 
    section: PRDSection, 
    context: AIPromptContext
  ): string {
    let optimized = basePrompt.replace('{projectName}', context.projectName);
    
    // Add context-specific optimizations
    optimized += `\n\nProject Context:
- Type: ${context.projectType}
- Tech Stack: ${context.techStack.join(', ')}
- Complexity: ${context.complexity}
- Target Audience: ${context.targetAudience}

Implementation Requirements:
${section.content}

Instructions:
1. Break down the requirements into implementable tasks
2. Provide specific code examples and configurations
3. Include error handling and edge cases
4. Follow industry best practices and security standards
5. Make code production-ready with proper testing
6. Provide clear documentation and comments

Output Format:
- Start with a brief overview of what you're implementing
- Provide step-by-step implementation with code
- Include testing strategies and examples
- End with deployment/integration notes`;

    return optimized;
  }

  private static generateTitle(field: string, projectName: string): string {
    const titles = {
      frontend: `Frontend Implementation for ${projectName}`,
      backend: `Backend API Development for ${projectName}`,
      database: `Database Schema & Setup for ${projectName}`,
      security: `Security Implementation for ${projectName}`,
      seo: `SEO Optimization for ${projectName}`,
      publish: `Deployment & Publishing Setup for ${projectName}`
    };
    
    return titles[field as keyof typeof titles] || `Implementation for ${projectName}`;
  }

  private static generateCodeExamples(field: string, context: AIPromptContext): string[] {
    const examples: Record<string, string[]> = {
      frontend: [
        `// Component structure example\nconst ${context.projectName}Component = () => {\n  return <div>Implementation here</div>;\n};`,
        `// State management example\nconst [state, setState] = useState(initialState);`,
        `// API integration example\nconst fetchData = async () => {\n  const response = await api.get('/endpoint');\n  return response.data;\n};`
      ],
      backend: [
        `// API endpoint example\napp.get('/api/endpoint', async (req, res) => {\n  // Implementation here\n});`,
        `// Database query example\nconst result = await db.query('SELECT * FROM table');`,
        `// Error handling example\ntry {\n  // Operation\n} catch (error) {\n  res.status(500).json({ error: error.message });\n}`
      ],
      database: [
        `-- Table creation example\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL\n);`,
        `-- Index creation example\nCREATE INDEX idx_users_email ON users(email);`,
        `-- Migration example\nALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();`
      ]
    };
    
    return examples[field] || examples.frontend;
  }

  private static generateTestingGuidance(field: string, context: AIPromptContext): string {
    const guidance: Record<string, string> = {
      frontend: `Testing Strategy:
1. Unit tests for components using Jest/Vitest
2. Integration tests for user flows using Testing Library
3. E2E tests for critical paths using Playwright/Cypress
4. Accessibility testing with axe-core
5. Performance testing with Lighthouse`,
      
      backend: `Testing Strategy:
1. Unit tests for services and utilities using Jest
2. API endpoint tests using supertest
3. Database integration tests with test database
4. Load testing for performance validation
5. Security testing for authentication and authorization`,
      
      database: `Testing Strategy:
1. Schema validation tests
2. Migration rollback tests
3. Performance tests for queries
4. Data integrity tests
5. Backup and recovery testing`
    };
    
    return guidance[field] || guidance.frontend;
  }

  private static extractDependencies(content: string, context: AIPromptContext): string[] {
    // Extract technology mentions and map to common dependencies
    const dependencies: string[] = [...context.dependencies];
    
    // Add field-specific dependencies based on content analysis
    if (content.includes('React')) dependencies.push('react', 'react-dom');
    if (content.includes('Express')) dependencies.push('express');
    if (content.includes('PostgreSQL')) dependencies.push('pg', 'prisma');
    if (content.includes('JWT')) dependencies.push('jsonwebtoken');
    if (content.includes('bcrypt')) dependencies.push('bcryptjs');
    
    return [...new Set(dependencies)];
  }

  private static estimateImplementationTime(section: PRDSection, context: AIPromptContext): string {
    const baseHours: Record<string, number> = {
      frontend: 8,
      backend: 12,
      database: 6,
      security: 10,
      seo: 4,
      publish: 6
    };
    
    const complexityMultiplier = {
      simple: 1,
      medium: 1.5,
      complex: 2.5
    };
    
    const hours = baseHours[section.field] * complexityMultiplier[context.complexity];
    const days = Math.ceil(hours / 8);
    
    return `${hours} hours (${days} day${days > 1 ? 's' : ''})`;
  }

  private static assessDifficulty(section: PRDSection, context: AIPromptContext): 'beginner' | 'intermediate' | 'advanced' {
    const complexityMap = {
      simple: 'beginner' as const,
      medium: 'intermediate' as const,
      complex: 'advanced' as const
    };
    
    return complexityMap[context.complexity];
  }

  private static generateFollowUpTasks(field: string, context: AIPromptContext): string[] {
    const tasks: Record<string, string[]> = {
      frontend: [
        'Implement responsive design',
        'Add loading states and error handling',
        'Optimize bundle size',
        'Add accessibility features',
        'Implement Progressive Web App features'
      ],
      backend: [
        'Add comprehensive logging',
        'Implement caching strategy',
        'Add API documentation',
        'Set up monitoring and alerts',
        'Optimize database queries'
      ],
      database: [
        'Set up backup strategy',
        'Implement data archiving',
        'Add database monitoring',
        'Optimize query performance',
        'Set up replication if needed'
      ]
    };
    
    return tasks[field] || tasks.frontend;
  }

  private static orderImplementationSteps(sections: PRDSection[]): PRDSection[] {
    const order = ['database', 'backend', 'security', 'frontend', 'seo', 'publish'];
    return sections.sort((a, b) => {
      const aIndex = order.indexOf(a.field);
      const bIndex = order.indexOf(b.field);
      return aIndex - bIndex;
    });
  }

  private static generateTaskDescription(field: string, context: AIPromptContext): string {
    const descriptions: Record<string, string> = {
      database: `Set up database schema and initial configuration for ${context.projectName}`,
      backend: `Implement backend API endpoints and business logic for ${context.projectName}`,
      security: `Implement authentication, authorization, and security measures for ${context.projectName}`,
      frontend: `Build user interface and frontend functionality for ${context.projectName}`,
      seo: `Optimize SEO and performance for ${context.projectName}`,
      publish: `Set up deployment pipeline and production environment for ${context.projectName}`
    };
    
    return descriptions[field] || `Implement ${field} for ${context.projectName}`;
  }

  private static getDependenciesForStep(section: PRDSection, previousSteps: PRDSection[]): string[] {
    const dependencies: Record<string, string[]> = {
      backend: ['database'],
      security: ['database', 'backend'],
      frontend: ['backend', 'security'],
      seo: ['frontend'],
      publish: ['frontend', 'backend', 'database', 'security', 'seo']
    };
    
    const requiredSteps = dependencies[section.field] || [];
    return requiredSteps.filter(step => 
      previousSteps.some(prev => prev.field === step)
    );
  }

  private static generateVerificationSteps(field: string, context: AIPromptContext): string {
    const steps: Record<string, string> = {
      database: 'Verify database connection, run test queries, check schema integrity',
      backend: 'Test all API endpoints, verify authentication, check error handling',
      security: 'Run security tests, verify authentication flows, check for vulnerabilities',
      frontend: 'Test user interactions, verify responsive design, check accessibility',
      seo: 'Run Lighthouse audit, verify meta tags, test page speed',
      publish: 'Verify deployment pipeline, test production environment, check monitoring'
    };
    
    return steps[field] || 'Verify implementation meets requirements';
  }

  private static optimizeForClaude(prompt: OptimizedPrompt, section: PRDSection, context: AIPromptContext): OptimizedPrompt {
    return {
      ...prompt,
      implementationPrompt: `${prompt.implementationPrompt}

Claude-specific optimizations:
- Think step by step through the implementation
- Consider multiple approaches and explain trade-offs
- Provide comprehensive error handling
- Include security considerations throughout
- Break complex tasks into smaller, manageable pieces`
    };
  }

  private static optimizeForGPT4(prompt: OptimizedPrompt, section: PRDSection, context: AIPromptContext): OptimizedPrompt {
    return {
      ...prompt,
      implementationPrompt: `${prompt.implementationPrompt}

GPT-4 specific optimizations:
- Use structured output format
- Include detailed code comments
- Provide alternative implementation approaches
- Focus on best practices and industry standards
- Include performance optimization considerations`
    };
  }

  private static optimizeForGemini(prompt: OptimizedPrompt, section: PRDSection, context: AIPromptContext): OptimizedPrompt {
    return {
      ...prompt,
      implementationPrompt: `${prompt.implementationPrompt}

Gemini-specific optimizations:
- Provide clear, actionable instructions
- Include visual architecture descriptions where relevant
- Focus on practical implementation details
- Emphasize testing and validation steps
- Include troubleshooting guidance`
    };
  }

  private static getCommonIssues(field: string): { name: string; solution: string }[] {
    const issues: Record<string, { name: string; solution: string }[]> = {
      frontend: [
        { name: 'Component not rendering', solution: 'Check props and state, verify JSX syntax' },
        { name: 'State not updating', solution: 'Ensure proper state setter usage, check for mutations' },
        { name: 'API calls failing', solution: 'Verify endpoint URLs, check CORS settings, handle errors' }
      ],
      backend: [
        { name: 'Database connection failing', solution: 'Check connection string, verify database is running' },
        { name: 'API endpoints returning errors', solution: 'Check request validation, verify middleware setup' },
        { name: 'Authentication not working', solution: 'Verify JWT implementation, check token expiration' }
      ]
    };
    
    return issues[field] || issues.frontend;
  }

  private static getDebuggingSteps(field: string): string[] {
    const steps: Record<string, string[]> = {
      frontend: [
        'Check browser console for errors',
        'Verify component props and state',
        'Test API endpoints in isolation',
        'Check network tab for failed requests'
      ],
      backend: [
        'Check server logs for errors',
        'Test endpoints with Postman/curl',
        'Verify database connections',
        'Check middleware execution order'
      ]
    };
    
    return steps[field] || steps.frontend;
  }

  private static generateDebuggingPrompt(issue: { name: string; solution: string }, section: PRDSection, context: AIPromptContext): string {
    return `I'm encountering this issue with my ${section.field} implementation for ${context.projectName}: "${issue.name}". 

The suggested solution is: ${issue.solution}

Please help me debug this by:
1. Analyzing the potential root causes
2. Providing step-by-step debugging instructions
3. Suggesting code fixes with examples
4. Explaining how to prevent this issue in the future

Context: ${context.projectType} project using ${context.techStack.join(', ')}`;
  }

  private static generateTroubleshootingPrompt(section: PRDSection, context: AIPromptContext, errorScenarios: string[]): string {
    return `I need help troubleshooting issues with my ${section.field} implementation for ${context.projectName}.

Error scenarios I'm experiencing:
${errorScenarios.map(scenario => `- ${scenario}`).join('\n')}

Project context:
- Type: ${context.projectType}
- Tech Stack: ${context.techStack.join(', ')}
- Complexity: ${context.complexity}

Please provide:
1. Systematic debugging approach
2. Common solutions for these error types
3. Code examples for fixes
4. Prevention strategies for future development
5. Testing approaches to catch these issues early`;
  }
}

/**
 * Factory function to create AI prompts for specific use cases
 */
export class AIPromptFactory {
  static createImplementationPrompt(prdContent: string, context: AIPromptContext, field: string): OptimizedPrompt {
    const section: PRDSection = {
      field: field as 'frontend' | 'backend' | 'database' | 'security' | 'seo' | 'publish',
      content: prdContent,
      priority: 'high'
    };
    
    return AIPromptOptimizer.generateImplementationPrompt(section, context);
  }
  
  static createProjectGuide(allSections: { field: string; content: string }[], context: AIPromptContext) {
    const sections: PRDSection[] = allSections.map(s => ({
      field: s.field as 'frontend' | 'backend' | 'database' | 'security' | 'seo' | 'publish',
      content: s.content,
      priority: 'high'
    }));
    
    return AIPromptOptimizer.generateStepByStepGuide(sections, context);
  }
  
  static createDebuggingAssistant(field: string, context: AIPromptContext, errors: string[]) {
    const section: PRDSection = {
      field: field as 'frontend' | 'backend' | 'database' | 'security' | 'seo' | 'publish',
      content: '',
      priority: 'high'
    };
    
    return AIPromptOptimizer.generateDebuggingPrompts(section, context, errors);
  }
}