<template>
  <a-tabs v-if="auth" v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="成绩汇总">
      <IndexPage :classes="gradeClasses" :grade="currentGrade" :score-data="gradeScore"/>
    </a-tab-pane>
    <a-tab-pane key="2" force-render tab="优秀学生数量">
      <ExcellentPage :grade="currentGrade" :score-data="gradeScore"></ExcellentPage>
    </a-tab-pane>
    <a-tab-pane key="3" force-render tab="学生成绩趋势图">
      <TendencyPage :classes="gradeClasses" :score-data="gradeScore"/>
    </a-tab-pane>
    <a-tab-pane key="4" force-render tab="配置中心">
      <ConfigPage :data-path="scorePath"></ConfigPage>
    </a-tab-pane>

    <template #leftExtra>
      <!--      <a-button class="tabs-extra-demo-button" @click="loadExcel">导入成绩单</a-button>-->
      <a-select v-model:value="currentExam" class="tabs-extra-demo-button">
        <a-select-option v-for="(item) in exam" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
      </a-select>
      <a-select v-model:value="currentGrade" class="tabs-extra-demo-button">
        <a-select-option v-for="(item) in grades" :key="item.grade" :value="item.grade">{{
            item.name
          }}
        </a-select-option>
      </a-select>
    </template>

    <template #rightExtra>
      <a style="margin-right: 20px" @click="callMe">联系作者</a>
      <a download href="/四（1）班学生成绩册--模板.xlsx" style="margin-right: 20px">下载模板</a>
      <LoginModal ref="login"/>
      <a-button type="primary" @click="open">登录</a-button>
    </template>
  </a-tabs>
</template>

<script>
import IndexPage from "@/components/IndexPage";
import ExcellentPage from "@/components/ExcellentPage";
import ConfigPage from "@/components/ConfigPage";
import {mapGetters} from "vuex";
import LoginModal from "@/components/LoginModal";
import TendencyPage from "@/components/TendencyPage";
import {notification} from "ant-design-vue";

const grades = [
  {grade: 1, name: "一年级"},
  {grade: 2, name: "二年级"},
  {grade: 3, name: "三年级"},
  {grade: 4, name: "四年级"},
  {grade: 5, name: "五年级"},
  {grade: 6, name: "六年级"},
]
export default {
  name: "MainPage",
  data() {
    return {
      activeKey: "1",
      scoreData: [],
      gradeScore: [],
      classes: [],
      gradeClasses: [],
      grades: grades,
      currentGrade: null,
      currentExam: null,
      scorePath: "",
      auth: true,
      visible: false
    }
  },
  computed: {
    ...mapGetters([
      'exam',
    ]),
  },
  components: {
    IndexPage,
    ExcellentPage,
    ConfigPage,
    TendencyPage,
    LoginModal
  },
  created() {
  },
  watch: {
    exam() {
      if (!this.exam || this.exam.length === 0 || !this.exam.find(i => i.id === this.currentExam)) {
        this.currentExam = null
      }
    },
    currentGrade(data) {
      this.getScore()
      this.gradeScore = this.scoreData.filter(function (item) {
        return item.class.toString().includes(data);
      })
      this.gradeClasses = this.classes.filter(function (item) {
        return item.includes(data);
      })
    },
    currentExam(value) {
      this.getScore()
      console.log("currentExam", value)
    }
  },
  methods: {

    callMe() {
      notification.open({
        message: "联系方式",
        description: "QQ：1057014556",
        duration: null,
        style: {
          width: '600px',
          marginLeft: `${335 - 600}px`,
          color: "red"
        },
      });
    },

    open() {
      this.$refs.login.open()
    },
    handleOk(form) {
      console.log("form", form)
      // 登录请求
      this.visible = false
    },
    getScore() {
      if (!this.currentExam || !this.currentGrade) {
        return
      }
      this.$axios.get("/api/score/" + this.currentExam + "/" + this.currentGrade).then(res => {
        if (res.data.cd === 0) {
          this.gradeScore = res.data.data
        } else {
          this.$message.error(res.data.msg)
          this.gradeScore = []
        }
      })
    },
  }
}
</script>

<style scoped>
.tabs-extra-demo-button {
  margin-right: 16px;
  min-width: 200px;
}

</style>