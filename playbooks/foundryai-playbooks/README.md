# FoundryAI Playbooks

Enterprise-grade playbooks, guides, and best practices for AI-powered development workflows.

## 📚 Contents

This directory contains comprehensive guides for:

### 🤖 Copilot & Codex Integration
- Prompt engineering best practices
- Code generation workflows
- Security-first AI assistance
- Context optimization strategies

### 🔒 Security & SAST Remediation
- Automated vulnerability patching
- LLM-powered code review
- Safe CI/CD practices
- Fork protection and access control

### 🛠️ Development Workflows
- Git best practices (GitKraken Bible)
- Monorepo management
- Code review automation
- Testing and validation strategies

### 🚀 Deployment & Operations
- Netlify configuration patterns
- Environment variable management
- Multi-service architecture
- Zero-downtime deployments

## 🎯 Quick Start Guides

### Using Codex for SAST Remediation

```bash
# Install dependencies
pnpm install

# Run remediation on SAST report
pnpm --filter ./packages/codex remediate --report ./gl-sast-report.json

# Review generated patches
ls codex_patches/
```

### Crafting Effective Prompts

**Principles:**
1. **Be specific**: Define exact deliverables and constraints
2. **Include context**: Provide relevant code snippets and file paths
3. **Set boundaries**: Specify what NOT to change
4. **Request validation**: Ask for justification or test cases

**Example Prompt Structure:**
```
Project: [Brief context]
Task: [Specific goal]
File: [Path and relevant content]
Constraints: [What to avoid]
Deliverable: [Expected output format]
```

## 📖 GitKraken Bible

Essential Git workflows and best practices:

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks
- `codex/*` - Automated fixes

### Commit Messages
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Merge Workflow
1. Create feature branch from `main`
2. Make atomic commits
3. Open PR with clear description
4. Request review (automated + human)
5. Address feedback
6. Squash and merge to `main`

## 🔐 Security Best Practices

### Secrets Management
- ✅ Use GitHub Secrets for API keys
- ✅ Never commit credentials
- ✅ Rotate keys regularly
- ✅ Use least-privilege access
- ❌ No hardcoded tokens
- ❌ No keys in logs or error messages

### Fork Protection
Always add this guard to sensitive workflows:
```yaml
if: ${{ github.event.pull_request.head.repo.fork == false }}
```

### Code Review Requirements
- Human approval for all automated PRs
- CODEOWNERS for sensitive paths
- Required status checks
- Branch protection rules

## 🧪 Testing Strategies

### Local Validation
```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Build application
pnpm build
```

### CI Validation
- Lint and format checks
- Type safety verification
- Unit and integration tests
- Security scanning (SAST)
- Build validation
- Deploy preview generation

## 📊 Monitoring & Observability

### Key Metrics
- Build success rate
- Deploy frequency
- Mean time to recovery (MTTR)
- Code review turnaround
- Security scan findings

### Alerting
- Failed builds
- Security vulnerabilities
- Performance degradation
- Error rate spikes

## 🤝 Contributing

When adding new playbooks:

1. Use clear, actionable titles
2. Include code examples
3. Add security considerations
4. Link to related documentation
5. Test all commands and scripts

## 📞 Support

For questions or issues:
- GitHub Issues: [brandonlacoste9-tech/Beehive](https://github.com/brandonlacoste9-tech/Beehive/issues)
- Documentation: See individual playbook files
- Examples: Check `examples/` directory

## 📄 License

MIT License - See [LICENSE](../../LICENSE) for details

---

**Built with ❤️ for the AdGenXAI platform**
