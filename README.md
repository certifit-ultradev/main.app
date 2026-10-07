# main.app
Landingpage and plattform

## Quality checks

Every pull request and push to `main` runs the architecture boundary check, TypeScript validation and the Jest suite in GitHub Actions. Run the same gates locally with:

```bash
npm run architecture:check
npm run typecheck
npm test -- --runInBand
```
