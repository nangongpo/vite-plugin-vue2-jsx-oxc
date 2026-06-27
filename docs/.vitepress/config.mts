import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

interface RepositoryObject {
  type?: string
  url?: string
}

interface PackageJson {
  name?: string
  repository?: string | RepositoryObject
}

const currentDir = dirname(fileURLToPath(import.meta.url))

const rootDir = resolve(currentDir, '../..')

const packageJson = JSON.parse(
  readFileSync(resolve(rootDir, 'package.json'), 'utf8')
) as PackageJson

/**
 * 从 package.json#repository 解析：
 *
 * owner/repository
 */
function parseRepositorySlug(repository: PackageJson['repository']): string {
  const value =
    typeof repository === 'string'
      ? repository
      : repository &&
          typeof repository === 'object' &&
          typeof repository.url === 'string'
        ? repository.url
        : ''

  if (!value) {
    return ''
  }

  const normalized = value
    .trim()
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')

  const match = normalized.match(/github\.com[/:]([^/]+)\/([^/]+)$/i)

  return match ? `${match[1]}/${match[2]}` : ''
}

/**
 * 规范化 VitePress base：
 *
 * /
 * /repository-name/
 */
function normalizeBase(value: string | undefined, fallback = '/'): string {
  const input = String(value || fallback).trim() || fallback

  const withLeadingSlash = input.startsWith('/') ? input : `/${input}`

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

/**
 * GitHub Actions 中优先读取：
 *
 * GITHUB_REPOSITORY=owner/repository
 *
 * 本地构建时从 package.json#repository 推导。
 */
const repositorySlug =
  process.env.GITHUB_REPOSITORY || parseRepositorySlug(packageJson.repository)

const [repositoryOwner = '', repositoryName = ''] = repositorySlug.split('/')

/**
 * GitHub Actions 中由 pages.yml 注入：
 *
 * DOCS_BASE=/repository-name/
 */
const base = normalizeBase(
  process.env.DOCS_BASE,
  repositoryName ? `/${repositoryName}/` : '/'
)

/**
 * GitHub Actions 中由 pages.yml 注入完整线上地址。
 *
 * 本地构建时自动推导。
 */
const demoUrl =
  process.env.DEMO_URL ||
  (repositoryOwner && repositoryName
    ? `https://${repositoryOwner}.github.io/${repositoryName}/playground/`
    : `${base}playground/`)

const githubUrl = repositorySlug
  ? `https://github.com/${repositorySlug}`
  : undefined

const npmUrl = packageJson.name
  ? `https://www.npmjs.com/package/${packageJson.name}`
  : undefined

/**
 * head 中的 favicon 不会自动处理 VitePress base，
 * 因此这里显式加上 base。
 */
const faviconUrl = `${base}logo.svg`

export default defineConfig({
  base,

  lang: 'zh-CN',

  title: 'Vue 2 JSX Oxc',

  description: 'Vite 8 + Vue 2.7 JSX/TSX 转换插件完整开发文档',

  cleanUrls: true,

  lastUpdated: true,

  head: [
    [
      'meta',
      {
        name: 'theme-color',
        content: '#21845f'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        href: faviconUrl
      }
    ]
  ],

  markdown: {
    lineNumbers: true,

    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '危险',
      infoLabel: '说明',
      detailsLabel: '查看详情'
    }
  },

  themeConfig: {
    /**
     * VitePress 会为主题 logo 自动处理 base。
     */
    logo: '/logo.svg',

    siteTitle: 'Vue 2 JSX Oxc',

    outline: {
      level: 'deep',
      label: '本页目录'
    },

    returnToTopLabel: '返回顶部',

    sidebarMenuLabel: '菜单',

    darkModeSwitchLabel: '主题',

    lastUpdatedText: '最后更新',

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    search: {
      provider: 'local'
    },

    nav: [
      {
        text: '指南',
        link: '/guide/introduction'
      },
      {
        text: '组件形态',
        link: '/components/overview'
      },
      {
        text: '语法功能',
        link: '/features/'
      },
      {
        text: '工程能力',
        link: '/engineering/hmr'
      },
      {
        text: 'Demo 文档',
        link: '/demo/'
      },
      {
        text: '在线 Demo',
        link: demoUrl,
        target: '_blank'
      },
      {
        text: 'API',
        link: '/reference/options'
      },

      ...(githubUrl
        ? [
            {
              text: 'GitHub',
              link: githubUrl
            }
          ]
        : []),

      ...(npmUrl
        ? [
            {
              text: 'npm',
              link: npmUrl
            }
          ]
        : [])
    ],

    sidebar: [
      {
        text: '开始使用',

        items: [
          {
            text: '插件介绍',
            link: '/guide/introduction'
          },
          {
            text: '安装与配置',
            link: '/guide/getting-started'
          },
          {
            text: 'Vite 8 集成',
            link: '/guide/integration'
          },
          {
            text: '配置项',
            link: '/guide/configuration'
          },
          {
            text: '转换流程',
            link: '/guide/pipeline'
          }
        ]
      },

      {
        text: 'Vue 组件形态',

        items: [
          {
            text: '覆盖总览',
            link: '/components/overview'
          },
          {
            text: '传统模板组件',
            link: '/components/traditional'
          },
          {
            text: 'SFC 局部 JSX/TSX',
            link: '/components/local-jsx'
          },
          {
            text: 'Options API render',
            link: '/components/options-api'
          },
          {
            text: '函数式组件',
            link: '/components/functional'
          },
          {
            text: 'setup() 组合式组件',
            link: '/components/composition-api'
          },
          {
            text: '独立 JSX/TSX 模块',
            link: '/components/modules'
          }
        ]
      },

      {
        text: 'JSX/TSX 功能',

        items: [
          {
            text: '功能总览',
            link: '/features/'
          },
          {
            text: 'VNodeData 与标签',
            link: '/features/vnode-data'
          },
          {
            text: '事件与 v-on',
            link: '/features/events'
          },
          {
            text: 'v-model',
            link: '/features/v-model'
          },
          {
            text: '指令',
            link: '/features/directives'
          },
          {
            text: '插槽',
            link: '/features/slots'
          },
          {
            text: 'Spread 合并',
            link: '/features/spread'
          },
          {
            text: 'SVG 与 Fragment',
            link: '/features/svg-fragment'
          }
        ]
      },

      {
        text: '工程能力',

        items: [
          {
            text: 'HMR',
            link: '/engineering/hmr'
          },
          {
            text: 'SSR',
            link: '/engineering/ssr'
          },
          {
            text: 'TypeScript 与 Source Map',
            link: '/engineering/typescript-sourcemap'
          },
          {
            text: 'Vite 8 依赖扫描',
            link: '/engineering/dependency-scan'
          }
        ]
      },

      {
        text: '参考',

        items: [
          {
            text: '完整 Demo',
            link: '/demo/'
          },
          {
            text: '插件 API',
            link: '/reference/options'
          },
          {
            text: '兼容范围',
            link: '/reference/compatibility'
          },
          {
            text: '迁移指南',
            link: '/reference/migration'
          },
          {
            text: '参与开发',
            link: '/reference/development'
          }
        ]
      }
    ],

    footer: {
      message: '基于 Oxc Parser 的 Vue 2.7 JSX/TSX 转换器',

      copyright: 'Released under the MIT License'
    }
  }
})
