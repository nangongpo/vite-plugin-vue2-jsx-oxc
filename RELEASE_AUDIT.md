# Release audit

Audit date: 2026-06-26

## Release identity

```text
npm package: vite-plugin-vue2-jsx-oxc
version: 0.0.0
GitHub repository: https://github.com/nangongpo/xxx
documentation: https://nangongpo.github.io/xxx/
Demo: https://nangongpo.github.io/xxx/playground/
Node.js: >= 22.12.0
package manager: pnpm 11.9.0
```

The npm registry query returned `404` for `vite-plugin-vue2-jsx-oxc` during this audit. Recheck immediately before publishing because package-name availability can change.

## Verification completed

- `pnpm install --frozen-lockfile`: passed.
- TypeScript checks for plugin and Demo: passed.
- Test files: 8 passed.
- Test cases: 56 passed.
- Vite 8 cold dependency scan: passed.
- Plugin ESM and declaration build: passed.
- Vue 2.7 client build: passed.
- Vue 2.7 SSR build: passed.
- Vue SSR runtime smoke test: passed.
- VitePress production build: passed.
- GitHub Pages base `/xxx/`: verified.
- Demo base `/xxx/playground/`: verified.
- Packed tarball installation in an independent consumer project: passed.
- Default export and `compileVue2Jsx` import from the packed package: passed.

## npm tarball contents

The release tarball contains exactly:

```text
package/CHANGELOG.md
package/LICENSE
package/README.md
package/dist/index.d.ts
package/dist/index.js
package/package.json
```

It does not contain source code, tests, Demo, documentation, GitHub workflows, dependency directories, lockfiles, or archive files.

## GitHub automation

- `.github/workflows/ci.yml`: Node 22 + pnpm verification.
- `.github/workflows/pages.yml`: builds and deploys VitePress plus the Vue 2.7 Demo.
- `.github/workflows/publish.yml`: pnpm install/build/pack, followed by npm trusted publishing of the generated tarball.

## Manual steps remaining

1. Create `https://github.com/nangongpo/xxx` and push this repository.
2. Set GitHub Pages source to **GitHub Actions**.
3. Run the first npm publication described in `RELEASING.md`.
4. Configure npm trusted publishing for `nangongpo/xxx`, workflow `publish.yml`, environment `npm`.
5. Create the GitHub `npm` environment, optionally with required reviewers.
