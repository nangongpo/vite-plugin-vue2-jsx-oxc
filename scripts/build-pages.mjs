import { execFileSync } from 'node:child_process'
import {
  accessSync,
  cpSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(currentDir, '..')

const packageJson = JSON.parse(
  readFileSync(resolve(rootDir, 'package.json'), 'utf8')
)

function parseRepositorySlug(repository) {
  const value =
    typeof repository === 'string'
      ? repository
      : repository?.url || ''

  if (!value) {
    return ''
  }

  const normalized = value
    .trim()
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')

  const match = normalized.match(
    /github\.com[/:]([^/]+)\/([^/]+)$/i
  )

  return match ? `${match[1]}/${match[2]}` : ''
}

function normalizeDocsBase(value, fallback = '/') {
  const input = String(value || fallback).trim() || '/'

  const result = input.startsWith('/')
    ? input
    : `/${input}`

  return result.endsWith('/')
    ? result
    : `${result}/`
}

function normalizeDemoBase(value) {
  const input = String(value || './').trim()

  if (!input || input === '.' || input === './') {
    return './'
  }

  const result = input.startsWith('/')
    ? input
    : `/${input}`

  return result.endsWith('/')
    ? result
    : `${result}/`
}

function run(args, extraEnv = {}) {
  const command =
    process.platform === 'win32'
      ? 'pnpm.cmd'
      : 'pnpm'

  execFileSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv
    }
  })
}

function assertFile(path, label) {
  try {
    accessSync(path)
  } catch {
    throw new Error(`${label} does not exist: ${path}`)
  }

  if (!statSync(path).isFile()) {
    throw new Error(`${label} is not a file: ${path}`)
  }
}

function assertNonEmptyDirectory(path, label) {
  try {
    accessSync(path)
  } catch {
    throw new Error(`${label} does not exist: ${path}`)
  }

  if (!statSync(path).isDirectory()) {
    throw new Error(`${label} is not a directory: ${path}`)
  }

  if (readdirSync(path).length === 0) {
    throw new Error(`${label} is empty: ${path}`)
  }
}

function verifyPlayground(playgroundDir) {
  const indexPath = resolve(playgroundDir, 'index.html')
  const assetsDir = resolve(playgroundDir, 'assets')

  assertFile(indexPath, 'Playground index')
  assertNonEmptyDirectory(assetsDir, 'Playground assets')

  const html = readFileSync(indexPath, 'utf8')

  const assetMatches = [
    ...html.matchAll(
      /(?:src|href)=["'](\.\/assets\/[^"'?#]+)(?:[?#][^"']*)?["']/g
    )
  ]

  const assets = assetMatches.map(match => match[1])

  if (assets.length === 0) {
    throw new Error(
      'No relative ./assets/ references found in playground/index.html'
    )
  }

  const absoluteAssetPattern =
    /(?:src|href)=["']\/[^"']*assets\//

  if (absoluteAssetPattern.test(html)) {
    throw new Error(
      'Playground contains absolute asset URLs. DEMO_BASE must be "./".'
    )
  }

  for (const asset of new Set(assets)) {
    const assetPath = resolve(
      playgroundDir,
      asset.slice('./'.length)
    )

    assertFile(assetPath, `Playground asset ${asset}`)
  }
}

const repositorySlug =
  process.env.GITHUB_REPOSITORY ||
  parseRepositorySlug(packageJson.repository)

const [repositoryOwner = '', repositoryName = ''] =
  repositorySlug.split('/')

const docsBase = normalizeDocsBase(
  process.env.DOCS_BASE,
  repositoryName ? `/${repositoryName}/` : '/'
)

const demoBuildBase = normalizeDemoBase(
  process.env.DEMO_BUILD_BASE || './'
)

const demoUrl =
  process.env.DEMO_URL ||
  (
    repositoryOwner && repositoryName
      ? `https://${repositoryOwner}.github.io/${repositoryName}/playground/`
      : `${docsBase}playground/`
  )

const docsDist = resolve(
  rootDir,
  'docs/.vitepress/dist'
)

const demoDist = resolve(
  rootDir,
  'demo/dist'
)

const playgroundDist = resolve(
  docsDist,
  'playground'
)

rmSync(docsDist, {
  recursive: true,
  force: true
})

rmSync(demoDist, {
  recursive: true,
  force: true
})

run(['build'])

run(
  ['--dir', 'docs', 'build'],
  {
    DOCS_BASE: docsBase,
    DEMO_URL: demoUrl,
    GITHUB_REPOSITORY: repositorySlug
  }
)

run(
  ['--dir', 'demo', 'build'],
  {
    DEMO_BASE: demoBuildBase
  }
)

assertFile(
  resolve(docsDist, 'index.html'),
  'Documentation index'
)

assertFile(
  resolve(demoDist, 'index.html'),
  'Demo index'
)

rmSync(playgroundDist, {
  recursive: true,
  force: true
})

cpSync(
  demoDist,
  playgroundDist,
  {
    recursive: true
  }
)

writeFileSync(
  resolve(docsDist, '.nojekyll'),
  ''
)

verifyPlayground(playgroundDist)

console.log('')
console.log('GitHub Pages output generated successfully')
console.log(`Repository: ${repositorySlug || '(local)'}`)
console.log(`Docs base: ${docsBase}`)
console.log(`Demo build base: ${demoBuildBase}`)
console.log(`Demo URL: ${demoUrl}`)
console.log(`Output: ${docsDist}`)
