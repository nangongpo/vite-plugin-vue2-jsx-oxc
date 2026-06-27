# 发布指南

## 环境

```text
Node.js >= 22.12
pnpm 11.9.0
GitHub: https://github.com/nangongpo/xxx
npm: vite-plugin-vue2-jsx-oxc
初始版本: 0.0.0
```

启用仓库声明的 pnpm 版本：

```bash
corepack enable
pnpm --version
```

## 发布前检查

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm release:check
pnpm pack --dry-run
```

npm 包必须只包含：

```text
package.json
README.md
CHANGELOG.md
LICENSE
dist/index.js
dist/index.d.ts
```

`src`、`tests`、`demo`、`docs`、`.github`、归档文件和 `node_modules` 不应进入 npm 包。

## 推送 GitHub

```bash
git init
git add .
git commit -m "feat: initial public release"
git branch -M main
git remote add origin git@github.com:nangongpo/xxx.git
git push -u origin main
```

在 GitHub 仓库中打开 **Settings → Pages → Build and deployment**，选择 **GitHub Actions**。

发布地址：

- 文档：`https://nangongpo.github.io/xxx/`
- Demo：`https://nangongpo.github.io/xxx/playground/`

## 首次发布到 npm

首次发布前先确认包名仍可用，并确认当前版本为 `0.0.0`：

```bash
pnpm view vite-plugin-vue2-jsx-oxc version
pnpm release:check
pnpm pack --out package.tgz
```

登录并发布生成的 tarball：

```bash
npm login
npm whoami
npm publish package.tgz --access public --registry=https://registry.npmjs.org/
```

版本发布后不可覆盖或复用，请在执行前再次确认包名、版本号和 tarball 内容。

## 配置 npm Trusted Publishing

首次发布完成后，在 npm 包设置中添加 GitHub Actions trusted publisher：

```text
GitHub owner: nangongpo
Repository: xxx
Workflow file: publish.yml
Environment: npm
```

然后在 GitHub **Settings → Environments** 中创建名为 `npm` 的 environment。工作流使用 OIDC，不需要保存长期 `NPM_TOKEN`。

仓库使用 pnpm 安装、测试和打包；最终上传使用支持 npm trusted publishing 的 npm CLI 发布 `package.tgz`。

## 后续版本

更新版本和 Changelog，例如：

```bash
pnpm version patch
pnpm verify
git push origin main --follow-tags
```

创建与版本一致的 GitHub Release，例如 `v0.0.1`。Release 发布后会触发 `.github/workflows/publish.yml`。
