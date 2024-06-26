<template>
  <a-table :columns="columns"
           :data-source="scoreData"
           :pagination="pagination"
           :scroll="{ y: screen.height -300}"
           bordered
           size="small">
    <!--eslint-disable-next-line vue/no-unused-vars-->
    <template #tendency="{ text, record }">
      <a-button type="link" @click="onclickTendency(record)">查看</a-button>
    </template>
    <template #headerCell="{ column }">
      <template v-if="column.key === 'name'">
        <span style="color: #1890ff">Name</span>
      </template>
    </template>
    <template
        #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
    >
      <div style="padding: 8px">
        <a-input
            ref="searchInput"
            :placeholder="`Search ${column.dataIndex}`"
            :value="selectedKeys[0]"
            style="width: 188px; margin-bottom: 8px; display: block"
            @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
            @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
            size="small"
            style="width: 90px; margin-right: 8px"
            type="primary"
            @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          <template #icon>
            <SearchOutlined/>
          </template>
          Search
        </a-button>
        <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
          Reset
        </a-button>
      </div>
    </template>
    <template #customFilterIcon="{ filtered }">
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }"/>
    </template>
    <template #bodyCell="{ text, column }">
      <span v-if="searchText && searchedColumn === column.dataIndex">
        <template
            v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
        >
          <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight"
          >
            {{ fragment }}
          </mark>
          <template v-else>{{ fragment }}</template>
        </template>
      </span>
    </template>
  </a-table>

  <a-modal
      :title="null"
      :visible="visible"
      @cancel="handleCancel"
      @ok="handleOk"
  >
    <div id="chart" :style="styleObj"/>
  </a-modal>

</template>
<script>
import * as echarts from 'echarts'
import {SearchOutlined} from '@ant-design/icons-vue';
import {defineComponent, reactive, ref, toRefs} from 'vue';
import {markRaw} from "vue";


export default defineComponent({
  components: {
    SearchOutlined,
  },
  props: {
    scoreData: {
      type: Array,
      default() {
        return []
      }
    },
    classes: {
      type: Array,
      default() {
        return []
      }
    },
    grades: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      pagination: {
        current: 1,
        pageSize: 30
      },
      visibleChart: false,
      visible: false,
      dataChart: null,
      styleObj: {
        width: '100%',
        height: `${window.screen.height / 2}px`,
      },
      screen: window.screen
    }
  },
  created() {

  },
  methods: {
    onclickTendency(student) {
      this.visible = true
      this.$nextTick(() => {
        if (this.dataChart === null) {
          console.log("12")
          this.dataChart = markRaw(echarts.init(document.getElementById("chart")));
          window.onresize = () => {
            this.dataChart.resize()
          }
        }
        this.drawChart()
      })

      console.log("onclickTendency", student)
    },
    handleOk() {
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
    onTableChange(pagination, filters, sorter) {
      console.log("onTableChange", pagination, filters, sorter)
    },
    drawChart() {
      // 绘制图表
      this.dataChart.setOption({
        xAxis: {
          data: ["4-3", "4-4", "4-5", "4-6", "4-7", "4-8", "4-9"]
        },
        yAxis: {},
        series: [
          {
            name: "用户量",
            type: "line",
            data: [8, 15, 31, 13, 15, 22, 11]
          }
        ]
      });


    }
  },
  watch: {
    classes(data) {
      console.log("data", data)
      this.columns[1].filters = data.map(item => {
        return {text: item, value: item};
      });
      this.$forceUpdate()
    }
  },
  setup() {
    const state = reactive({
      searchText: '',
      searchedColumn: '',
    });

    const searchInput = ref();

    const columns = [
      {
        title: '学号',
        dataIndex: 'student_num',
        align: 'center',
        sorter: (a, b) => a.student_name - b.student_name,
        customFilterDropdown: true,
        onFilter: (value, record) => record.student_name.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              searchInput.value.focus();
            }, 100);
          }
        },
      },
      {
        title: '班级',
        dataIndex: 'class',
        filters: [],
        filterMultiple: false,
        align: 'center'
      },
      {
        title: '姓名',
        dataIndex: 'student_name',
        align: 'center',
        customFilterDropdown: true,
        onFilter: (value, record) => record.student_name && record.student_name.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              searchInput.value.focus();
            }, 100);
          }
        },
      },
      {
        title: '趋势图',
        slots: {customRender: 'tendency'}
      },
    ];

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = clearFilters => {
      clearFilters({confirm: true});
      state.searchText = '';
    };


    return {
      columns,
      handleSearch,
      handleReset,
      searchInput,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>
