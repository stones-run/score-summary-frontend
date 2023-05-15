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
  </a-table>
</template>

<script>

export default {
  name: "ExcellentPage",
  components: {
  },
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
          align: 'center'
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
  },
  methods: {
    getExcellent() {
      // 每个班级的优秀学生数
      let sortDataMap = {}
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

    getExcellent3() {
      // 每个班级的优秀学生数
      let sortDataMap = {}
      // 计算已经统计了多少学生，当遇到相同排名时，统计为一个
      let count = 0
      // 当前统计的学生总分
      let currentTotal = 0
      // 最后一名优秀学生的成绩
      let lastTotal = 0
      for (let i = 0; i < this.sortData.length; i++) {
        const student = this.sortData[i]
        //当前学生的总分和最后一名优秀学生的成绩相同时，依然算进去，当小于则结束统计
        if (student.total < lastTotal) {
          break
        }
        if (student.total !== currentTotal) {
          count += 1
        }
        currentTotal = student.total
        if (sortDataMap[student.class] === undefined) {
          sortDataMap[student.class] = 1
        } else {
          sortDataMap[student.class]++
        }
        if (count === this.standard) {
          lastTotal = currentTotal
        }
      }
      this.excellentData = Object.keys(sortDataMap).map(function (i) {
        return {name: i, value: sortDataMap[i]};
      });
    },

    getExcellent2() {
      let sortDataMap = {}
      for (let i = 0; i < this.standard; i++) {
        if (i >= this.sortData.length) {
          break
        }
        const student = this.sortData[i]
        if (sortDataMap[student.class] === undefined) {
          sortDataMap[student.class] = 1
        } else {
          sortDataMap[student.class]++
        }
      }
      this.excellentData = Object.keys(sortDataMap).map(function (i) {
        return {name: i, value: sortDataMap[i]};
      });
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