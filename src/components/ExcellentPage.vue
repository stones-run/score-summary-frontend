<template>
  <div>
    <span>优秀学生排名阈值：</span>
    <a-input-number v-model:value="standard" :min="1" style="width: 100px"/>
  </div>

  <a-table :columns="columns"
           :data-source="excellentData"
           :pagination="false"
           bordered
  >
    <template #class="{text}">
      （{{ text }}）班
    </template>
  </a-table>
</template>

<script>

export default {
  name: "ExcellentPage",
  components: {},
  data() {
    return {
      pagination: {
        current: 1,
        pageSize: 10
      },
      sortData: [],
      excellentData: [],
      columns: [
        {
          title: '班级',
          dataIndex: 'name',
          align: 'center',
          slots: {customRender: 'class'}
        },
        {
          title: '人数',
          dataIndex: 'value',
          align: 'center'
        }
      ],
      standard: 10,
    }
  },
  watch: {
    scoreData() {
      this.sortScore()
      this.getExcellent()
    },
    standard() {
      this.getExcellent()
    }
  },
  props: {
    scoreData: {
      type: Array,
      default() {
        return []
      }
    },
    grade: {
      type: Number,
    }
  },
  methods: {
    getExcellent() {
      // 每个班级的优秀学生数
      if (!this.sortData || this.sortData.length === 0) {
        this.excellentData = []
      }
      let sortDataMap = {}
      console.log("this.sortData", this.sortData)
      for (let i = 0; i < this.sortData.length; i++) {
        const student = this.sortData[i]
        if (student.totalGradeRank <= this.standard) {
          sortDataMap[student.class] === undefined ? sortDataMap[student.class] = 1 : sortDataMap[student.class]++
        } else {
          break
        }
        this.excellentData = Object.keys(sortDataMap).map(function (i) {
          return {name: i, value: sortDataMap[i]};
        });
      }
    },
    sortScore() {
      const scoreData = this.scoreData

      function compare(a, b) {
        let comparison = 0;
        if (a.totalGradeRank > b.totalGradeRank) {
          comparison = 1;
        } else if (a.totalGradeRank < b.totalGradeRank) {
          comparison = -1;
        }
        return comparison;
      }

      scoreData.sort(compare);
      console.log("scoreData", scoreData)
      this.sortData = scoreData

    }
  },
}
</script>

<style scoped>

</style>