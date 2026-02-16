# Contributing

## Workflow
1. Fork and clone the repository.
2. Create a branch from `main`:
```bash
git checkout -b feature/your-change
```
3. Make focused commits with clear messages.
4. Run tests from `server/`:
```bash
npm test
```
5. Open a pull request with:
- Problem statement
- What changed
- How it was tested

## Code Style
- Keep files and functions small and readable.
- Add validation and authorization checks for new endpoints.
- Keep API responses consistent (`message`, resource payload, and proper status codes).
- If schema changes are introduced, include a Prisma migration.

## Pull Request Checklist
- [ ] Tests added/updated where applicable
- [ ] No secrets committed
- [ ] README/docs updated if behavior changed
- [ ] Manual test steps included
