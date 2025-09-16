const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3000/api';
const SAMPLE_DOCS_DIR = path.join(__dirname, '../sample-docs');

async function uploadDocument(filePath, fileName) {
  try {
    const { default: fetch } = await import('node-fetch');
    
    const form = new FormData();
    form.append('document', fs.createReadStream(filePath), {
      filename: fileName,
      contentType: getContentType(fileName)
    });

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Uploaded: ${fileName}`);
    console.log(`   ID: ${result.id}, Category: ${result.category || 'N/A'}, Tags: ${result.tags?.join(', ') || 'None'}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    return null;
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.md':
      return 'text/markdown';
    case '.txt':
      return 'text/plain';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'text/plain';
  }
}

async function uploadAllSampleDocuments() {
  console.log('🚀 Starting sample document upload...\n');

  try {
    // Check if sample-docs directory exists
    if (!fs.existsSync(SAMPLE_DOCS_DIR)) {
      console.log('📁 Creating sample-docs directory...');
      fs.mkdirSync(SAMPLE_DOCS_DIR, { recursive: true });
    }

    // Create sample documents if they don't exist
    const sampleDocs = [
      {
        fileName: 'software-architecture-principles.md',
        content: `# Software Architecture Principles

## Introduction
Software architecture is the foundation of any successful software system. It defines the structure, behavior, and interactions of system components.

## Key Principles

### 1. Separation of Concerns
Each component should have a single responsibility and should not be concerned with other components' internal workings.

### 2. Modularity
Break down complex systems into smaller, manageable modules that can be developed, tested, and maintained independently.

### 3. Scalability
Design systems to handle increased load gracefully through horizontal or vertical scaling.

### 4. Maintainability
Code should be written with future maintenance in mind, using clear naming conventions and documentation.

## Design Patterns

### Microservices Architecture
- Independent, loosely coupled services
- Each service owns its data
- Communication through well-defined APIs
- Enables independent deployment and scaling

### Event-Driven Architecture
- Components communicate through events
- Loose coupling between producers and consumers
- Enables real-time processing and scalability

## Best Practices
- Start simple and evolve the architecture
- Use established patterns and frameworks
- Document architectural decisions
- Regular architecture reviews
- Consider non-functional requirements early`
      },
      {
        fileName: 'engineering-leadership-guide.md',
        content: `# Engineering Leadership Guide

## The Role of an Engineering Leader

Engineering leadership is about guiding teams to deliver high-quality software while fostering a culture of innovation and continuous improvement.

## Core Responsibilities

### 1. Technical Vision
- Set technical direction and standards
- Make architectural decisions
- Balance technical debt with feature delivery
- Stay current with technology trends

### 2. Team Development
- Mentor and coach engineers
- Conduct performance reviews
- Identify and develop talent
- Create growth opportunities

### 3. Process Improvement
- Implement agile methodologies
- Optimize development workflows
- Establish code review processes
- Promote testing and quality assurance

## Leadership Styles

### Servant Leadership
- Focus on team success over personal recognition
- Remove obstacles and provide resources
- Empower team members to make decisions
- Lead by example

### Transformational Leadership
- Inspire and motivate through vision
- Challenge the status quo
- Encourage innovation and creativity
- Build strong relationships

## Communication Skills

### Effective Communication
- Active listening
- Clear and concise messaging
- Regular one-on-ones
- Transparent decision-making

### Stakeholder Management
- Regular updates to executives
- Technical explanations for non-technical audiences
- Managing expectations
- Building trust and credibility

## Building High-Performing Teams

### Team Composition
- Diverse skills and perspectives
- Complementary strengths
- Clear role definitions
- Balanced workload distribution

### Culture and Values
- Psychological safety
- Continuous learning
- Ownership and accountability
- Recognition and celebration`
      },
      {
        fileName: 'code-review-best-practices.md',
        content: `# Code Review Best Practices

## Introduction
Code reviews are a critical part of the software development process, ensuring code quality, knowledge sharing, and team collaboration.

## Benefits of Code Reviews

### Quality Assurance
- Catch bugs before they reach production
- Ensure code follows team standards
- Improve code readability and maintainability
- Validate test coverage

### Knowledge Sharing
- Spread knowledge across the team
- Share best practices and patterns
- Onboard new team members
- Document implicit knowledge

## Code Review Process

### 1. Preparation
- Ensure code compiles and tests pass
- Write clear commit messages
- Keep changes focused and small
- Self-review before requesting review

### 2. Review Request
- Provide context and background
- Explain complex changes
- Link to related issues or tickets
- Choose appropriate reviewers

### 3. Review Process
- Review within 24 hours
- Focus on logic, not style
- Ask questions, don't just criticize
- Approve when ready

## What to Look For

### Functionality
- Does the code solve the problem?
- Are edge cases handled?
- Is error handling appropriate?
- Are there any security concerns?

### Code Quality
- Is the code readable and maintainable?
- Are there any code smells?
- Is the code following team conventions?
- Are there opportunities for refactoring?

### Testing
- Are there adequate tests?
- Do tests cover edge cases?
- Are tests readable and maintainable?
- Is test coverage appropriate?

## Best Practices

### For Authors
- Keep changes small and focused
- Write clear commit messages
- Respond to feedback constructively
- Be open to suggestions

### For Reviewers
- Be respectful and constructive
- Focus on the code, not the person
- Explain the reasoning behind suggestions
- Approve when criteria are met

### For Teams
- Establish clear review criteria
- Set expectations for review time
- Use automated tools where possible
- Regular retrospectives on the process`
      }
    ];

    // Write sample documents to files
    for (const doc of sampleDocs) {
      const filePath = path.join(SAMPLE_DOCS_DIR, doc.fileName);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, doc.content);
        console.log(`📝 Created: ${doc.fileName}`);
      }
    }

    console.log('\n📤 Uploading documents...\n');

    // Upload each document
    const results = [];
    for (const doc of sampleDocs) {
      const filePath = path.join(SAMPLE_DOCS_DIR, doc.fileName);
      const result = await uploadDocument(filePath, doc.fileName);
      if (result) {
        results.push(result);
      }
    }

    console.log(`\n🎉 Upload complete! Successfully uploaded ${results.length} documents.`);
    
    // Display summary
    if (results.length > 0) {
      console.log('\n📊 Upload Summary:');
      results.forEach(doc => {
        console.log(`   • ${doc.title} (ID: ${doc.id})`);
        console.log(`     Category: ${doc.category || 'General'}`);
        console.log(`     Tags: ${doc.tags?.join(', ') || 'None'}`);
        console.log(`     Word Count: ${doc.wordCount || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during upload process:', error.message);
    process.exit(1);
  }
}

// Run the upload process
uploadAllSampleDocuments();
