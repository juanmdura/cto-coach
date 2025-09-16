# Code Review Best Practices

## Purpose of Code Reviews

### Quality Assurance
- Catch bugs and logic errors before production
- Ensure code meets quality standards
- Verify proper error handling and edge cases
- Check for security vulnerabilities

### Knowledge Sharing
- Share domain knowledge across the team
- Teach best practices and patterns
- Introduce new team members to codebase
- Cross-train team members on different areas

### Collaboration
- Foster team communication and collaboration
- Build consensus on technical approaches
- Maintain consistent coding styles
- Create shared ownership of code

## Review Process

### Before Submitting
- Self-review your own code first
- Write clear commit messages and PR descriptions
- Include context about the change and why it's needed
- Ensure tests pass and code compiles
- Keep changes focused and reasonably sized

### During Review
- Review code promptly (within 24 hours)
- Focus on logic, design, and maintainability
- Check for proper testing and documentation
- Verify security and performance considerations
- Be constructive and specific in feedback

### Review Checklist
- Does the code solve the stated problem?
- Is the solution appropriately complex (not over/under-engineered)?
- Are there adequate tests covering the changes?
- Is the code readable and well-documented?
- Are there any security concerns?
- Does it follow team coding standards?

## Giving Effective Feedback

### Be Constructive
- Focus on the code, not the person
- Explain the "why" behind suggestions
- Offer alternative solutions when possible
- Acknowledge good practices and improvements

### Communication Style
- Use "we" instead of "you" when possible
- Ask questions rather than making demands
- Provide examples and references
- Be specific about what needs to change

### Prioritize Issues
- Distinguish between must-fix and nice-to-have
- Focus on functionality and maintainability first
- Address style issues consistently but with lower priority
- Consider the cost-benefit of each suggestion

## Receiving Feedback

### Open Mindset
- View feedback as learning opportunities
- Don't take criticism personally
- Ask clarifying questions when feedback is unclear
- Thank reviewers for their time and input

### Responding to Feedback
- Address all feedback, even if you disagree
- Explain your reasoning for different approaches
- Make requested changes promptly
- Follow up when changes are complete

## Common Anti-Patterns

### Reviewer Anti-Patterns
- Nitpicking on minor style issues
- Requesting changes without explanation
- Being overly critical or harsh
- Ignoring the bigger picture for small details

### Author Anti-Patterns
- Submitting large, unfocused changes
- Not testing changes before submission
- Ignoring or arguing with all feedback
- Not providing context for changes

## Tools and Automation

### Automated Checks
- Use linters and formatters to catch style issues
- Implement automated testing in CI/CD
- Run security scans and dependency checks
- Check for code coverage thresholds

### Review Tools
- Use pull request templates for consistency
- Implement review assignment rules
- Set up notifications and reminders
- Track review metrics and cycle times
