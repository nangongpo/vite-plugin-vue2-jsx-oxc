import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const viteBin = fileURLToPath(
  new URL('../node_modules/vite/bin/vite.js', import.meta.url)
)

const child = spawn(
  process.execPath,
  [
    viteBin,
    'demo',
    '--config',
    'demo/vite.config.ts',
    '--host',
    '127.0.0.1',
    '--port',
    '5199',
    '--strictPort',
    '--force',
    '--clearScreen',
    'false'
  ],
  {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  }
)

let output = ''
let settled = false
let readyResolve
let readyReject
const ready = new Promise((resolve, reject) => {
  readyResolve = resolve
  readyReject = reject
})

function collect(chunk) {
  const text = chunk.toString()
  output += text
  if (!settled && /Local:\s+http:\/\/127\.0\.0\.1:5199/.test(output)) {
    settled = true
    readyResolve()
  }
}

child.stdout.on('data', collect)
child.stderr.on('data', collect)
child.on('error', error => {
  if (!settled) {
    settled = true
    readyReject(error)
  }
})
child.on('exit', code => {
  if (!settled) {
    settled = true
    readyReject(new Error(`Vite exited before ready with code ${code}\n${output}`))
  }
})

const timeout = setTimeout(() => {
  if (!settled) {
    settled = true
    readyReject(new Error(`Timed out waiting for Vite\n${output}`))
  }
}, 20_000)

try {
  await ready
  clearTimeout(timeout)

  const base = 'http://127.0.0.1:5199'
  const urls = [
    '/',
    '/src/main.ts',
    '/src/App.vue',
    '/src/components/features/SpreadDemo.vue',
    '/src/components/features/SpreadDemo.vue?vue&type=script&lang.jsx'
  ]

  for (const url of urls) {
    const response = await fetch(base + url)
    if (!response.ok) {
      throw new Error(`Request failed: ${url} (${response.status})`)
    }
    await response.text()
  }

  await new Promise(resolve => setTimeout(resolve, 1200))

  if (/react\/jsx-(?:dev-)?runtime/.test(output)) {
    throw new Error(`React JSX runtime leaked into dependency scan\n${output}`)
  }

  if (/Failed to run dependency scan/.test(output)) {
    throw new Error(`Dependency scan failed\n${output}`)
  }

  console.log('Vite 8 cold dependency scan: passed')
} finally {
  clearTimeout(timeout)
  child.kill('SIGTERM')
  await new Promise(resolve => {
    const timer = setTimeout(resolve, 2_000)
    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}
