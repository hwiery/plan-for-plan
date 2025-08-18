
export const PromptTemplates = {
  ideaAnalysis: `
    Analyze the following idea and provide a detailed analysis covering the following aspects:
    - Category: Classify the idea into a relevant category (e.g., SaaS, E-commerce, Mobile App).
    - Feasibility: Evaluate the technical and market feasibility of the idea.
    - Similar Services: List any similar services or competitors.

    Idea: {idea}
  `,
  questionGeneration: `
    Based on the initial idea and the previous questions and answers, generate the next question to ask the user.
    The goal is to gather enough information to create a detailed Product Requirements Document (PRD).
    The question can be open-ended (text), multiple-choice (select), or multiple-selection (checkbox).
    For multiple-choice or checkbox questions, provide the options in a pipe-separated list.
    
    Format your response as follows:
    Question: [Your question here]
    Type: [text|select|checkbox]
    Options: [option1|option2|option3] (only for select/checkbox)

    Initial Idea: {idea}
    Previous Q&A: {qa_history}

    Next Question:
  `,
  prdGeneration: {
    frontend: `
# Frontend Implementation Specification

Based on the project requirements, generate a comprehensive frontend specification that an AI can implement directly.

## Project Context
{context}

## Required Output Format:

### 1. Technology Stack
- Framework: (React, Vue, Angular, etc.)
- UI Library: (Material-UI, Tailwind CSS, Bootstrap, etc.)
- State Management: (Redux, Zustand, Context API, etc.)
- Build Tool: (Vite, Webpack, Create React App, etc.)

### 2. Component Architecture
List all major components with their responsibilities:
- ComponentName: Brief description and props interface
- Include: Layout components, Feature components, Shared components

### 3. Page Structure
For each page/route:
- Page Name: /route-path
  - Purpose: What this page does
  - Components used: List of components
  - State required: What data this page manages
  - API calls: Which endpoints this page hits

### 4. State Management Design
- Global state structure
- Actions/reducers needed
- Local component state requirements

### 5. Routing Configuration
- Route paths and corresponding components
- Protected routes and authentication requirements
- Route parameters and query handling

### 6. API Integration Points
- Endpoint mappings
- Request/response handling
- Error handling strategies
- Loading states

### 7. Responsive Design Requirements
- Breakpoint specifications
- Mobile-first considerations
- Touch interaction requirements

### 8. Performance Optimizations
- Code splitting points
- Lazy loading strategies
- Caching requirements
- Bundle size targets

Generate detailed, implementation-ready specifications for each section.
    `,
    backend: `
# Backend Implementation Specification

Based on the project requirements, generate a comprehensive backend specification that an AI can implement directly.

## Project Context
{context}

## Required Output Format:

### 1. Technology Stack
- Runtime: (Node.js, Python, Java, etc.)
- Framework: (Express, FastAPI, Spring Boot, etc.)
- Database: (PostgreSQL, MongoDB, MySQL, etc.)
- ORM/ODM: (Prisma, SQLAlchemy, Mongoose, etc.)
- Authentication: (JWT, OAuth, Session-based, etc.)

### 2. API Design
For each endpoint, specify:
- Method and Path: GET /api/example
- Purpose: What this endpoint does
- Parameters: Query params, path params, body structure
- Request/Response schemas: Exact JSON structure
- Authentication: Required permissions
- Error responses: HTTP status codes and error formats

### 3. Database Integration
- Connection configuration
- Migration strategies
- Seeding requirements
- Connection pooling setup

### 4. Business Logic Architecture
- Service layer organization
- Data validation rules
- Business rule implementations
- Error handling patterns

### 5. Authentication & Authorization
- User authentication flow
- JWT token structure
- Role-based access control
- Session management
- Password hashing strategy

### 6. Middleware Requirements
- CORS configuration
- Rate limiting setup
- Request logging
- Error handling middleware
- Validation middleware

### 7. External Integrations
- Third-party API integrations
- Payment processing (if applicable)
- Email services
- File upload handling

### 8. Performance & Scalability
- Caching strategies
- Query optimization
- Background job processing
- API response optimization

Generate detailed, implementation-ready specifications for each section with code examples where applicable.
    `,
    database: `
# Database Schema & Architecture Specification

Based on the project requirements, generate a comprehensive database specification that an AI can implement directly.

## Project Context
{context}

## Required Output Format:

### 1. Database Technology Choice
- Database type: (PostgreSQL, MySQL, MongoDB, etc.)
- Justification: Why this database fits the requirements
- Version requirements: Specific version recommendations

### 2. Schema Design
For each table/collection, provide:
- Table name: users
  - Columns: name (type, constraints, description)
  - Primary key: Specify primary key strategy
  - Indexes: Required indexes for performance
  - Relationships: Foreign keys and relationships to other tables
  - Constraints: Unique, not null, check constraints

### 3. Relationships & Associations
- One-to-Many relationships with foreign key specifications
- Many-to-Many relationships with junction table designs
- One-to-One relationships where applicable
- Referential integrity rules

### 4. Data Types & Validation
- Specific data types for each field
- Length constraints and ranges
- Enum values where applicable
- JSON/JSONB field structures (if using)

### 5. Indexing Strategy
- Primary indexes
- Composite indexes for query optimization
- Full-text search indexes (if needed)
- Partial indexes for conditional queries

### 6. Migration Scripts
- Table creation scripts
- Index creation scripts
- Seed data scripts
- Version control for schema changes

### 7. Performance Considerations
- Query optimization strategies
- Partitioning requirements (if applicable)
- Connection pooling configuration
- Backup and recovery procedures

### 8. Security Measures
- Column-level encryption requirements
- Row-level security policies
- Audit trail implementation
- Data retention policies

Provide exact SQL/query code for table creation, indexes, and sample data insertion.
    `,
    security: `
# Security Implementation Specification

Based on the project requirements, generate a comprehensive security specification that an AI can implement directly.

## Project Context
{context}

## Required Output Format:

### 1. Authentication System
- Authentication method: (JWT, OAuth 2.0, Session-based, etc.)
- Token configuration: Expiration, refresh strategy, storage
- Password requirements: Length, complexity, hashing algorithm
- Multi-factor authentication: Implementation if required
- Social login: Providers and configuration

### 2. Authorization & Access Control
- Role-based access control (RBAC) structure
- Permission matrix: Roles and their permissions
- Resource-level access control
- API endpoint protection strategies
- Route guards implementation

### 3. Input Validation & Sanitization
- Request validation schemas
- SQL injection prevention measures
- XSS prevention strategies
- CSRF protection implementation
- File upload security measures

### 4. Data Protection
- Data encryption at rest: What data to encrypt and how
- Data encryption in transit: TLS/SSL configuration
- Personal data handling: GDPR/privacy compliance
- Data masking for logs and debugging
- Secure data deletion procedures

### 5. API Security
- Rate limiting configuration: Requests per minute/hour
- CORS policy: Allowed origins and methods
- API key management (if applicable)
- Request/response validation
- Security headers implementation

### 6. Infrastructure Security
- Environment variable management
- Secret management: API keys, database credentials
- HTTPS enforcement
- Security headers: HSTS, CSP, X-Frame-Options
- Error handling: Secure error messages

### 7. Monitoring & Logging
- Security event logging: What to log and where
- Failed authentication attempt tracking
- Suspicious activity detection
- Audit trail implementation
- Log retention and protection

### 8. Compliance & Best Practices
- OWASP Top 10 mitigation strategies
- Data privacy regulations compliance
- Security testing requirements
- Vulnerability scanning setup
- Incident response procedures

Provide specific code examples and configuration files for each security measure.
    `,
    seo: `
# SEO Implementation Specification

Based on the project requirements, generate a comprehensive SEO specification that an AI can implement directly.

## Project Context
{context}

## Required Output Format:

### 1. Technical SEO Foundation
- HTML semantic structure requirements
- Meta tags configuration for each page type
- Open Graph and Twitter Card implementations
- Structured data (Schema.org) markup specifications
- Canonical URL management

### 2. Site Architecture & Navigation
- URL structure and naming conventions
- Internal linking strategy
- Breadcrumb navigation implementation
- Site hierarchy and information architecture
- XML sitemap generation requirements

### 3. Page-Level Optimization
For each page type, specify:
- Title tag templates and character limits
- Meta description templates and optimization
- Header tag hierarchy (H1, H2, H3) usage
- Image alt text requirements
- Content optimization guidelines

### 4. Performance Optimization
- Core Web Vitals targets: LCP, FID, CLS
- Image optimization: formats, compression, lazy loading
- CSS and JavaScript optimization
- Caching strategies for SEO
- Mobile page speed requirements

### 5. Content Strategy
- Keyword research and targeting approach
- Content freshness and update schedules
- Internal content linking strategies
- Content categorization and tagging
- Duplicate content prevention measures

### 6. Mobile & Responsive SEO
- Mobile-first indexing considerations
- Responsive design implementation
- Touch-friendly interface requirements
- Mobile site speed optimization
- AMP implementation (if applicable)

### 7. Analytics & Tracking
- Google Analytics 4 setup
- Google Search Console integration
- Goal and conversion tracking setup
- SEO performance monitoring
- Custom event tracking for user behavior

### 8. Local SEO (if applicable)
- Local business schema markup
- Google My Business optimization
- Local keyword targeting
- Location-based content strategies
- Review management integration

Provide specific code snippets for meta tags, structured data, and tracking implementations.
    `,
    publish: `
# Deployment & Publishing Specification

Based on the project requirements, generate a comprehensive deployment specification that an AI can implement directly.

## Project Context
{context}

## Required Output Format:

### 1. Infrastructure Architecture
- Hosting platform recommendation: (Vercel, AWS, Google Cloud, etc.)
- Environment setup: Development, staging, production
- Domain and DNS configuration requirements
- SSL certificate setup and management
- CDN configuration for static assets

### 2. Build & Deployment Pipeline
- CI/CD platform: (GitHub Actions, GitLab CI, Jenkins, etc.)
- Build process configuration
- Testing automation in pipeline
- Deployment triggers and conditions
- Rollback procedures and strategies

### 3. Environment Configuration
- Environment variables management
- Secret management: API keys, database credentials
- Configuration differences per environment
- Feature flags implementation (if applicable)
- Environment-specific settings

### 4. Database Deployment
- Database hosting solution
- Migration deployment strategy
- Backup and recovery procedures
- Connection pooling configuration
- Database scaling considerations

### 5. Monitoring & Logging
- Application monitoring setup
- Error tracking and reporting
- Performance monitoring tools
- Log aggregation and analysis
- Uptime monitoring configuration

### 6. Security in Production
- Production security checklist
- Firewall and network security
- Regular security updates process
- Vulnerability scanning setup
- Incident response procedures

### 7. Performance Optimization
- Caching strategies: CDN, application-level, database
- Load balancing configuration (if needed)
- Auto-scaling rules and triggers
- Performance monitoring and alerting
- Bundle optimization for production

### 8. Maintenance & Updates
- Regular maintenance schedules
- Update deployment procedures
- Backup verification processes
- Health check endpoints
- Disaster recovery plan

Provide specific configuration files, scripts, and step-by-step deployment instructions for the chosen platform.
    `,
  }
};

export const fillTemplate = (template: string, data: Record<string, string>) => {
  return template.replace(/{(\w+)}/g, (placeholder, key) => {
    return data[key] || placeholder;
  });
};
