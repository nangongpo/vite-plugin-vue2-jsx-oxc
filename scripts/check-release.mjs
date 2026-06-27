import { execFileSync } from 'node:child_process'
import {
  existsSync,
  readFileSync
} from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

const pkg = JSON.parse(
  readFileSync(
    resolve(root, 'package.json'),
    'utf8'
  )
)

const errors = []

const requiredFiles = [
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'dist/index.js',
  'dist/index.d.ts'
]

const allowedPackageFiles = new Set([
  'package.json',
  ...requiredFiles
])

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) {
    errors.push(
      `missing publish file: ${file}`
    )
  }
}

if (pkg.name !== 'vite-plugin-vue2-jsx-oxc') {
  errors.push(
    'package.json.name must be vite-plugin-vue2-jsx-oxc'
  )
}

// if (pkg.version !== '0.0.0') {
//   errors.push('package.json.version must be 0.0.0 for the initial release')
// }

if (!semverPattern.test(pkg.version)) {
  errors.push(
    `package.json.version is not a valid SemVer version: ${pkg.version}`
  )
}

if (!pkg.repository?.url) {
  errors.push(
    'package.json.repository.url is required'
  )
}

if (!pkg.homepage) {
  errors.push(
    'package.json.homepage is required'
  )
}

if (!pkg.bugs?.url) {
  errors.push(
    'package.json.bugs.url is required'
  )
}

if (pkg.private === true) {
  errors.push(
    'package.json must not be private'
  )
}

if (
  !String(pkg.packageManager || '')
    .startsWith('pnpm@')
) {
  errors.push(
    'package.json.packageManager must pin pnpm'
  )
}

if (
  pkg.publishConfig?.registry !==
  'https://registry.npmjs.org/'
) {
  errors.push(
    'publishConfig.registry must be https://registry.npmjs.org/'
  )
}

/**
 * GitHub Release 工作流可以通过 RELEASE_TAG
 * 显式传入 Release 标签。
 *
 * 普通 tag 工作流则使用 GITHUB_REF_NAME。
 */
const tag =
  process.env.RELEASE_TAG ||
  (
    process.env.GITHUB_REF_TYPE === 'tag'
      ? process.env.GITHUB_REF_NAME
      : null
  )

if (
  tag &&
  tag !== `v${pkg.version}` &&
  tag !== pkg.version
) {
  errors.push(
    `Git tag ${tag} does not match package version ${pkg.version}`
  )
}

const sourceFiles = [
  resolve(root, 'src/dep-scan.ts'),
  resolve(root, 'tests/dep-scan.spec.ts')
]

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')

  if (
    /from\s+['"]rolldown['"]/.test(source)
  ) {
    errors.push(
      `${file} must not import rolldown directly`
    )
  }
}

let packOutput

try {
  packOutput = execFileSync(
    'pnpm',
    [
      'pack',
      '--dry-run',
      '--json'
    ],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: [
        'ignore',
        'pipe',
        'pipe'
      ]
    }
  )
} catch (error) {
  errors.push(
    `pnpm pack --dry-run failed: ${
      error.stderr || error.message
    }`
  )
}

if (packOutput) {
  try {
    const parsed = JSON.parse(packOutput)

    const pack = Array.isArray(parsed)
      ? parsed[0]
      : parsed

    const entries =
      pack.files ||
      pack.contents ||
      []

    const files = new Set(
      entries.map(item =>
        typeof item === 'string'
          ? item
          : item.path
      )
    )

    for (const file of allowedPackageFiles) {
      if (!files.has(file)) {
        errors.push(
          `npm package is missing: ${file}`
        )
      }
    }

    const unexpected = [...files].filter(
      file => !allowedPackageFiles.has(file)
    )

    if (unexpected.length) {
      errors.push(
        `npm package contains unexpected files: ${
          unexpected.join(', ')
        }`
      )
    }
  } catch (error) {
    errors.push(
      `failed to parse pnpm pack output: ${error.message}`
    )
  }
}

if (errors.length) {
  console.error(
    `Release check failed:\n- ${errors.join('\n- ')}`
  )

  process.exit(1)
}

console.log(
  `Release check passed for ${pkg.name}@${pkg.version}.`
)
