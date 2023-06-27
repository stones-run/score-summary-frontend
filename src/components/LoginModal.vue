<template>
  <a-modal
      v-model:visible="visible"
      title="用户登录"
      :footer="null"
  >
    <a-form
        :model="form"
        name="basic"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
    >
      <a-form-item
          label="账号："
          name="username"
          :rules="[{ required: true, message: '请输入账号' }]"
      >
        <a-input v-model:value="form.username"/>
      </a-form-item>
      <a-form-item
          label="密码："
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
      >
        <a-input-password v-model:value="form.password"/>
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
        <a-button type="primary" html-type="submit">确认</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>

import {defineComponent} from 'vue';

export default defineComponent({
  data() {
    return {
      visible: false,
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    onFinish(values) {
      console.log('Success:', values);
      if (values.username === "tmj" && values.password === "0221") {
        this.$store.commit("isLogin", true)
        this.visible = false
      } else {
        this.$message.error("账密错误，请联系唐敏娟")
      }
    },
    onFinishFailed(errorInfo) {
      console.log('Failed:', errorInfo);
    }
  },
});

</script>