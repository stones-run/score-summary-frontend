<template>
  <div class="hello">
    <a-table
        ref="table"
        :columns="columns"
        :data-source="scoreData"
        :pagination="pagination"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-white' : 'table-striped')"
        :scroll="{ y: screen.height -330}"
        bordered
        class="ant-table-striped"
        size="small"
        @change="onTableChange">
      <!--eslint-disable-next-line vue/no-unused-vars-->
      <!--      <template #index="{ text, record, index }">-->
      <!--        <p style="color: red">{{ getRanking(index) }}</p>-->
      <!--      </template>-->
      <template #class="{text}">
        （{{ text }}）班
      </template>
      <template #pagination="{ current, pageSize, total }">
        <a-pagination
            :current="current"
            :page-size="pageSize"
            :total="total"
        />
      </template>
    </a-table>
  </div>
</template>

<script>

const columnsBase = [
  // {
  //   title: '序号',
  //   slots: {customRender: 'index'}
  // },
  {
    title: '学号',
    dataIndex: 'student_num',
    width: 80,
    align: 'center',
  },
  {
    title: '班级',
    dataIndex: 'class',
    filters: [],
    filterMultiple: false,
    onFilter: (value, record) => record.class === value,
    width: 110,
    align: 'center',
    slots: {customRender: 'class'}
  },
  {
    title: '姓名',
    dataIndex: 'student_name',
    align: 'center'
  },
  {
    title: '语文',
    dataIndex: 'chinese',
    sorter: (a, b) => a.chinese - b.chinese,
    align: 'center'
  },
  {
    title: '数学',
    dataIndex: 'math',
    sorter: (a, b) => a.math - b.math,
    align: 'center'
  },
  {
    title: '英语',
    dataIndex: 'english',
    sorter: (a, b) => a.english - b.english,
    align: 'center'
  },
  {
    title: '道法',
    dataIndex: 'daoism',
    sorter: (a, b) => a.daoism - b.daoism,
    align: 'center'
  },
  {
    title: '科学',
    dataIndex: 'science',
    sorter: (a, b) => a.science - b.science,
    align: 'center'
  },
  {
    title: '总分',
    dataIndex: 'total',
    sorter: (a, b) => a.total - b.total,
    align: 'center',
    className: "col-style",
  }
]

const columnsClasses = [
  {
    title: '总分',
    dataIndex: 'totalClassRank',
    sorter: (a, b) => a.totalClassRank - b.totalClassRank,
    align: 'center',
    className: "col-style",
  },
  {
    title: '语文',
    dataIndex: 'chineseClassRank',
    sorter: (a, b) => a.chineseClassRank - b.chineseClassRank,
    align: 'center'
  },
  {
    title: '数学',
    dataIndex: 'mathClassRank',
    sorter: (a, b) => a.mathClassRank - b.mathClassRank,
    align: 'center'
  },
  {
    title: '英语',
    dataIndex: 'englishClassRank',
    sorter: (a, b) => a.englishClassRank - b.englishClassRank,
    align: 'center'
  },
  {
    title: '道法',
    dataIndex: 'daoismClassRank',
    sorter: (a, b) => a.daoismClassRank - b.daoismClassRank,
    align: 'center'
  },
  {
    title: '科学',
    dataIndex: 'scienceClassRank',
    sorter: (a, b) => a.scienceClassRank - b.scienceClassRank,
    align: 'center'
  }
]

const columnsGrades = [
  {
    title: '总分',
    dataIndex: 'totalGradeRank',
    sorter: (a, b) => a.totalGradeRank - b.totalGradeRank,
    align: 'center',
    className: "col-style",
  },
  {
    title: '语文',
    dataIndex: 'chineseGradeRank',
    sorter: (a, b) => a.chineseGradeRank - b.chineseGradeRank,
    align: 'center'
  },
  {
    title: '数学',
    dataIndex: 'mathGradeRank',
    sorter: (a, b) => a.mathGradeRank - b.mathGradeRank,
    align: 'center'
  },
  {
    title: '英语',
    dataIndex: 'englishGradeRank',
    sorter: (a, b) => a.englishGradeRank - b.englishGradeRank,
    align: 'center'
  },
  {
    title: '道法',
    dataIndex: 'daoismGradeRank',
    sorter: (a, b) => a.daoismGradeRank - b.daoismGradeRank,
    align: 'center'
  },
  {
    title: '科学',
    dataIndex: 'scienceGradeRank',
    sorter: (a, b) => a.scienceGrade - b.scienceGrade,
    align: 'center'
  }
]

export default {
  name: "IndexPage",
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
  watch: {
    scoreData(data) {
      let classes = Array.from(new Set(data.map(item => item.class))).map(item => ({text: item, value: item}))
      this.columns[0].children[1].filters = classes
    }
  },
  data() {
    return {
      pagination: {
        current: 1,
        pageSize: 30
      },
      currentGrade: "",
      isAscend: null,
      // 当前排序的列和顺序
      columns: [
        {
          title: '基本成绩',
          children: columnsBase
        },
        {
          title: '班级排名',
          children: columnsClasses
        },
        {
          title: '年级排名',
          children: columnsGrades
        },
      ],
    }
  },
  computed: {
    screen() {
      return window.screen
    }
  },
  methods: {


    onTableChange(pagination, filters, sorter) {
      this.pagination = pagination
      if (sorter.order === "ascend") {
        this.isAscend = true
      } else if (sorter.order === "descend") {
        this.isAscend = false
      } else {
        this.isAscend = null
      }
      console.log("onTableChange", pagination, filters, sorter)
    }
    ,
  }
  ,
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.hello {
  text-align: center;
}

.ant-table-striped .table-striped {
  background-color: #f3f8fe;
}

.ant-table-striped .table-white {
  background-color: #ffffff;
}

.ant-table-striped .col-style {
  background: #cbdcf7;

}

</style>