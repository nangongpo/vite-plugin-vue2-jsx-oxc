<template>
  <main class="demo-shell">
    <header class="hero-panel">
      <p class="eyebrow">Vite 8 · Vue 2.7 · Oxc Parser</p>
      <h1>vite-plugin-vue2-jsx-oxc</h1>
      <p class="hero-copy">
        Vue 单文件组件、Options API、函数式组件、Composition API、JSX、TSX 与全部语法能力示例。
      </p>
      <div class="hero-badges">
        <span>真实 .vue SFC</span>
        <span>JSX + TSX</span>
        <span>HMR + SSR</span>
      </div>
    </header>

    <DemoSection
      id="traditional"
      title="Vue 单文件组件"
      description="传统模板组件，以及在普通 Vue SFC 中局部声明 JSX/TSX 子组件。"
    >
      <TraditionalCard />
      <LocalJsxInSfc />
      <LocalTsxInSfc />
    </DemoSection>

    <DemoSection
      id="options-api"
      title="Options API render"
      description="在 .vue 文件中使用 JSX 和 TSX script 编写 render。"
    >
      <OptionsRenderJsx />
      <OptionsRenderTsx />
    </DemoSection>

    <DemoSection
      id="functional"
      title="函数式组件"
      description="Vue 2 functional SFC 与 JSX/TSX 箭头函数语法糖。"
    >
      <FunctionalSfcJsx text="functional SFC / JSX" />
      <FunctionalSfcTsx text="functional SFC / TSX" :count="functionalCount" />
      <FunctionalArrowJsx label="functional arrow / JSX" @activate="functionalCount += 1" />
      <FunctionalArrowTsx label="functional arrow / TSX" :value="functionalCount" />
    </DemoSection>

    <DemoSection
      id="composition"
      title="setup() 组合式组件"
      description="Vue 2.7 原生 Composition API、setup context、render function 与 JSX/TSX 模块。"
    >
      <SetupSfcJsx />
      <SetupSfcTsx />
      <SetupRenderInstanceSfc />
      <SetupContextSfc :ping-total="setupPings" data-source="setup-context" @ping="setupPings += 1">
        <p class="section-note">setup context 默认插槽内容</p>
      </SetupContextSfc>
      <SetupModuleJsx />
      <SetupModuleTsx />
    </DemoSection>

    <DemoSection
      id="modules"
      title="独立 JSX / TSX 组件"
      description="不依赖 .vue 文件，直接使用 Vue.extend 或 defineComponent 输出组件。"
    >
      <StandaloneJsx />
      <StandaloneTsx />
      <HmrNamedCard />
    </DemoSection>

    <DemoSection
      id="features"
      title="Vue 2 JSX 功能覆盖"
      description="VNodeData、事件、v-model、指令、插槽、spread、SVG、Fragment 等全部转换能力。"
    >
      <VNodeDataDemo />
      <VModelDemo />
      <VOnDemo />
      <DirectiveDemo />
      <SlotsDemo />
      <SpreadDemo />
      <SvgFragmentDemo />
    </DemoSection>

    <footer class="demo-footer">
      修改任意 JSX、TSX 或 Vue SFC 文件可验证 HMR；执行 pnpm demo:ssr-build 可验证 SSR 转换。
    </footer>
  </main>
</template>

<script>
import DemoSection from './components/shared/DemoSection.vue'
import TraditionalCard from './components/traditional/TraditionalCard.vue'
import LocalJsxInSfc from './components/traditional/LocalJsxInSfc.vue'
import LocalTsxInSfc from './components/traditional/LocalTsxInSfc.vue'
import OptionsRenderJsx from './components/options/OptionsRenderJsx.vue'
import OptionsRenderTsx from './components/options/OptionsRenderTsx.vue'
import FunctionalSfcJsx from './components/functional/FunctionalSfcJsx.vue'
import FunctionalSfcTsx from './components/functional/FunctionalSfcTsx.vue'
import { FunctionalArrowJsx } from './components/functional/FunctionalArrow.jsx'
import { FunctionalArrowTsx } from './components/functional/FunctionalArrow.tsx'
import SetupSfcJsx from './components/composition/SetupSfcJsx.vue'
import SetupSfcTsx from './components/composition/SetupSfcTsx.vue'
import SetupContextSfc from './components/composition/SetupContextSfc.vue'
import SetupRenderInstanceSfc from './components/composition/SetupRenderInstanceSfc.vue'
import SetupModuleJsx from './components/composition/SetupModule.jsx'
import SetupModuleTsx from './components/composition/SetupModule.tsx'
import StandaloneJsx from './components/modules/StandaloneJsx.jsx'
import StandaloneTsx from './components/modules/StandaloneTsx.tsx'
import { HmrNamedCard } from './components/modules/HmrNamedCard.jsx'
import VNodeDataDemo from './components/features/VNodeDataDemo.vue'
import VModelDemo from './components/features/VModelDemo.vue'
import VOnDemo from './components/features/VOnDemo.vue'
import DirectiveDemo from './components/features/DirectiveDemo.vue'
import SlotsDemo from './components/features/SlotsDemo.vue'
import SpreadDemo from './components/features/SpreadDemo.vue'
import SvgFragmentDemo from './components/features/SvgFragmentDemo.tsx'

export default {
  name: 'DemoApp',
  components: {
    DemoSection,
    TraditionalCard,
    LocalJsxInSfc,
    LocalTsxInSfc,
    OptionsRenderJsx,
    OptionsRenderTsx,
    FunctionalSfcJsx,
    FunctionalSfcTsx,
    FunctionalArrowJsx,
    FunctionalArrowTsx,
    SetupSfcJsx,
    SetupSfcTsx,
    SetupContextSfc,
    SetupRenderInstanceSfc,
    SetupModuleJsx,
    SetupModuleTsx,
    StandaloneJsx,
    StandaloneTsx,
    HmrNamedCard,
    VNodeDataDemo,
    VModelDemo,
    VOnDemo,
    DirectiveDemo,
    SlotsDemo,
    SpreadDemo,
    SvgFragmentDemo
  },
  data() {
    return {
      functionalCount: 0,
      setupPings: 0
    }
  }
}
</script>
