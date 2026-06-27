<script lang="tsx">
import { defineComponent, reactive } from 'vue'
import ModelInput from '../shared/ModelInput.vue'

export default defineComponent({
  name: 'SetupRenderInstanceSfc',
  setup() {
    const form = reactive({
      name: '',
      amount: 1,
      skills: [] as string[]
    })

    return () => (
      <article class="demo-card">
        <span class="case-label">composition render instance</span>
        <h3>setup() 中的 v-model 运行时辅助</h3>
        <p>
          源码没有使用 this；编译器仅为 v-model 生成的
          $set、_n、_i 辅助调用捕获当前 Vue 实例。
        </p>

        <ModelInput
          label="姓名"
          placeholder="输入姓名"
          vModel={form.name}
        />

        <label class="field-row">
          <span>数量</span>
          <input
            class="control"
            type="number"
            vModel_number={form.amount}
          />
        </label>

        <div class="inline-options">
          {['JSX', 'TSX'].map(skill => (
            <label key={skill}>
              <input
                type="checkbox"
                value={skill}
                vModel={form.skills}
              />
              {skill}
            </label>
          ))}
        </div>

        <p class="result-line">
          name: {form.name || '-'} · amount: {form.amount} · skills:{' '}
          {form.skills.join(', ') || '-'}
        </p>
      </article>
    )
  }
})
</script>
