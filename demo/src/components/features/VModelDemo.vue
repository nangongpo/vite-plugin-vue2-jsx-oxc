<script lang="jsx">
import ModelInput from '../shared/ModelInput.vue'

export default {
  name: 'VModelDemo',
  components: { ModelInput },
  data() {
    return {
      form: { name: 'Oxc' },
      text: ' trim me ',
      lazyText: 'textarea',
      checks: ['A'],
      enabled: 'yes',
      choice: 'B',
      selected: 2,
      multiple: ['A']
    }
  },
  render() {
    return (
      <article class="demo-card wide-card">
        <span class="case-label">v-model 全类型</span>
        <h3>组件与原生表单</h3>
        <div class="form-grid">
          <ModelInput label="组件 model + trim + $set" vModel_trim={this.form.name} />
          <label class="field-row"><span>input trim</span><input class="control" vModel_trim={this.text} /></label>
          <label class="field-row"><span>textarea lazy</span><textarea class="control" vModel_lazy={this.lazyText} /></label>
          <label><input type="checkbox" value="A" vModel={this.checks} /> A</label>
          <label><input type="checkbox" value="B" vModel={this.checks} /> B</label>
          <label><input type="checkbox" true-value="yes" false-value="no" vModel={this.enabled} /> enabled</label>
          <label><input type="radio" value="A" vModel={this.choice} /> A</label>
          <label><input type="radio" value="B" vModel={this.choice} /> B</label>
          <select class="control" vModel_number={this.selected}>
            <option value="1">one</option><option value="2">two</option>
          </select>
          <select class="control" multiple vModel={this.multiple}>
            <option value="A">A</option><option value="B">B</option><option value="C">C</option>
          </select>
        </div>
        <pre>{JSON.stringify({ form: this.form, text: this.text, checks: this.checks, enabled: this.enabled, choice: this.choice, selected: this.selected, multiple: this.multiple }, null, 2)}</pre>
      </article>
    )
  }
}
</script>
