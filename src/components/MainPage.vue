<template>
  <a-tabs v-if="auth" v-model:activeKey="activeKey">
    <a-tab-pane key="1" tab="成绩汇总">
      <IndexPage :classes="gradeClasses" :score-data="gradeScore"/>
    </a-tab-pane>
    <a-tab-pane key="2" force-render tab="优秀学生数量">
      <ExcellentPage :score-data="gradeScore"></ExcellentPage>
    </a-tab-pane>
    <a-tab-pane v-if="false" key="3" force-render tab="学生成绩趋势图">
      <TendencyPage :classes="gradeClasses" :score-data="gradeScore"/>
    </a-tab-pane>
    <a-tab-pane key="4" force-render tab="配置中心">
      <ConfigPage :data-path="scorePath"></ConfigPage>
    </a-tab-pane>

    <template #leftExtra>
      <!--      <a-button class="tabs-extra-demo-button" @click="loadExcel">导入成绩单</a-button>-->
      <a-select v-model:value="currentScore" class="tabs-extra-demo-button">
        <a-select-option v-for="(item, index) in scores" :key="index" :value="item">{{ item }}</a-select-option>
      </a-select>
      <a-select v-model:value="currentGrade" class="tabs-extra-demo-button">
        <a-select-option v-for="(item, index) in grades" :key="index" :value="item">{{ item }}</a-select-option>
      </a-select>
    </template>
  </a-tabs>
</template>

<script>
import IndexPage from "@/components/IndexPage";
import ExcellentPage from "@/components/ExcellentPage";
import ConfigPage from "@/components/ConfigPage";
import {mapGetters} from "vuex";
import TendencyPage from "@/components/TendencyPage";

export default {
  name: "MainPage",
  data() {
    return {
      activeKey: "1",
      scoreData: [],
      gradeScore: [],
      classes: [],
      gradeClasses: [],
      grades: [],
      currentGrade: "",
      currentScore: "",
      scorePath: "",
      scores: [],
      auth: true
    }
  },
  computed: {
    ...mapGetters([
      'scoreDataPath',
    ]),
  },
  components: {
    IndexPage,
    ExcellentPage,
    ConfigPage,
    TendencyPage
  },
  created() {
    const options = {
      method: 'GET',
    };
    fetch("http://47.111.64.228:8888/ss-auth", options)
        .then((response) => {
          if (!response.ok) {
            this.auth = false
          }
          console.log("resp", response)
          return response.json();
        })
        .then((json) => {
          console.log("json", json, typeof json)
          this.auth = json.auth
        })
        .catch((error) => {
          this.auth = false
          console.error("error", error)
        });

    console.log(this.$store, "scoreDataPath", this.$store.state)


  },
  watch: {
    grades(data) {
      this.currentGrade = data[0]
      this.$forceUpdate()
      console.log("grades", this.currentGrade)
    },
    currentGrade(data) {
      this.gradeScore = this.scoreData.filter(function (item) {
        return item.class.toString().includes(data);
      })
      this.gradeClasses = this.classes.filter(function (item) {
        return item.includes(data);
      })
    },
    currentScore(value) {
      console.log("currentScore", value)
      this.$ipcRenderer.send("getExcelsData", {dir: value, rootPath: this.scorePath})
    }
  },
  methods: {

  }
}
</script>

<style scoped>
.tabs-extra-demo-button {
  margin-right: 16px;
  min-width: 100px;
}

</style>