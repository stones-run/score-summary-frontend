<template>
  <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="handleAdd" type="primary">增加考试</a-button>
  <a-divider type="vertical"/>


  <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="saveExam" type="primary">保存</a-button>
  <a-table bordered :data-source="dataSource" :columns="columns" row-key="id">
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'name'">
        <div class="editable-cell">
          <div v-if="editableData[record.id]" class="editable-cell-input-wrapper">
            <a-input v-model:value="editableData[record.id].name" @pressEnter="save(record.id)"/>
            <check-outlined class="editable-cell-icon-check" @click="save(record.id)"/>
          </div>
          <div v-else class="editable-cell-text-wrapper">
            {{ text || ' ' }}
            <edit-outlined class="editable-cell-icon" @click="edit(record.id)"/>
          </div>
        </div>
      </template>
      <template v-else-if="column.dataIndex === 'sort'">
        <a-button size="small" style="marginRight: 8px" @click="moveUp(record.id)">
          <template #icon>
            <up-outlined/>
          </template>
        </a-button>
        <a-button size="small" @click="moveDown(record.id)">
          <template #icon>
            <down-outlined/>
          </template>
        </a-button>
      </template>
      <template v-else-if="column.dataIndex === 'operation'">
        <a-popconfirm
            v-if="dataSource.length"
            title="删除考试将清空此次考试下上传的所有成绩数据，确定么？"
            @confirm="onDelete(record.id)"
        >
          <a>删除</a>
        </a-popconfirm>
      </template>
    </template>
    <template #expandedRowRender="{record}">
      <a-table :columns="innerColumns" :data-source="record.data" :pagination="false" row-key="id">
        <template #bodyCell="{ column,text,index }">
          <template v-if="column.dataIndex === 'is_upload'">
            <span v-if="text">
              <a-badge status="success"/>
              已上传
            </span>
            <span v-else>
              <a-badge status="default"/>
              未上传
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <a-upload
                name="file"
                ref="uploadRef"
                :headers="headers"
                :multiple="true"
                :before-upload="beforeUpload"
                @change="(info) => handleChange(info, record.id, index)"
            >
              <a-button>
                <upload-outlined></upload-outlined>
                批量上传
              </a-button>
            </a-upload>
          </template>
        </template>
      </a-table>
    </template>
  </a-table>
</template>

<script>
import {computed, defineComponent, reactive, ref} from 'vue';
import {CheckOutlined, EditOutlined, UpOutlined, DownOutlined, UploadOutlined} from '@ant-design/icons-vue';
import {cloneDeep} from 'lodash-es';
import {getExcelData} from "@/utils/scoreExcel";

export default defineComponent({
  components: {
    CheckOutlined,
    EditOutlined,
    UpOutlined,
    DownOutlined,
    UploadOutlined
  },
  data() {
    return {
      uploadData: [],
      uploadExcel: [],
      updateExam: {}
    }
  },
  created() {
    this.getExamData()
  },
  methods: {
    getExamData() {
      this.$axios.get("/api/exam").then(res => {
        res = res.data
        if (res.cd === 0) {
          this.dataSource = res.data;
        } else {
          this.$message.error(res.msg)
        }
        console.log(res)
      })
    },
    onDelete(key) {
      this.$axios.delete("/api/exam/" + key).then(res => {
        res = res.data
        if (res.cd === 0) {
          this.dataSource = this.dataSource.filter((item) => item.id !== key);
        } else {
          this.$message.error(res.data.msg)
        }
        console.log(res)
      })
    },
    handleAdd() {
      const newData = {
        name: `第${this.dataSource.length + 1}次考试`,
        data: [
          {grade: 1, is_upload: false},
          {grade: 2, is_upload: false},
          {grade: 3, is_upload: false},
          {grade: 4, is_upload: false},
          {grade: 5, is_upload: false},
          {grade: 6, is_upload: false},
        ]
      }
      this.$axios.post("/api/exam", newData).then(res => {
        res = res.data
        if (res.cd === 0) {
          res.data.data = newData.data
          this.dataSource.push(res.data)
        } else {
          this.$message.error(res.msg)
        }
        console.log(res)
      })
    },
    async readFiles() {
      const promises = [];
      for (const uploadExcel of this.uploadExcel) {
        if (uploadExcel.fileList && uploadExcel.fileList.length > 0) {
          const {examId, grade} = uploadExcel;
          this.data.update.grade.push(grade);
          this.data.update.exam_id.push(examId);
          for (const file of uploadExcel.fileList) {
            const promise = new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target.result;
                const excelData = getExcelData(result, examId, grade);
                this.data.score = [...this.data.score, ...excelData];
                resolve();
              };
              reader.readAsArrayBuffer(file.originFileObj);
            });
            promises.push(promise);
          }
        }
      }
      await Promise.all(promises);
    },
    async saveExam() {
      this.data = {
        exam: this.dataSource,
        score: [],
        update: {
          grade: [],
          exam_id: []
        }
      }
      await this.readFiles();
      this.$axios.post("/api/score", this.data).then(res => {
        console.log(res)
      })
    },
    handleChange(info, examId, grade) {
      console.log("info.file.status", info, examId, grade)
      console.log(info.fileList[0], info.file, info.file === info.fileList[0])
      let uploadExcel = this.uploadExcel.filter(data => data.grade === grade && data.examId === examId)
      if (uploadExcel && uploadExcel.length > 0) {
        uploadExcel[0].fileList = [...uploadExcel[0].fileList, ...info.fileList]
      } else {
        let data = {examId: examId, grade: grade, fileList: info.fileList}
        this.uploadExcel.push(data)
      }
    },

    beforeUpload() {
      return false;
    }
  },
  setup() {
    const columns = [
      {
        title: '考试',
        dataIndex: 'name',
        width: '30%',
      },
      {
        title: '排序',
        dataIndex: 'sort',
      },
      {
        title: '操作',
        dataIndex: 'operation',
      },
    ];
    const innerColumns = [
      {
        title: '年级',
        dataIndex: 'grade',
      },
      {
        title: '是否上传',
        dataIndex: 'is_upload',
      },
      {
        title: '操作',
        dataIndex: 'operation',
      },
    ];
    const dataSource = ref([]);
    const count = computed(() => dataSource.value.length + 1);
    const editableData = reactive({});
    const edit = (id) => {
      console.log("edit", id)
      editableData[id] = cloneDeep(
          dataSource.value.filter((item) => id === item.id)[0]
      );
    };
    const save = (id) => {
      console.log("save", id, editableData[id])
      Object.assign(
          dataSource.value.filter((item) => id === item.id)[0],
          editableData[id]
      );
      delete editableData[id];
    };


    const moveUp = (id) => {
      const index = dataSource.value.findIndex((item) => item.id === id);
      if (index > 0) {
        const temp = dataSource.value[index];
        dataSource.value[index] = dataSource.value[index - 1];
        dataSource.value[index - 1] = temp;
      }
    };
    const moveDown = (id) => {
      const index = dataSource.value.findIndex((item) => item.id === id);
      console.log("moveDown", index, id, dataSource.value)
      if (index < dataSource.value.length - 1) {
        const temp = dataSource.value[index];
        dataSource.value[index] = dataSource.value[index + 1];
        dataSource.value[index + 1] = temp;
      }
    };
    const fileList = ref([]);

    return {
      fileList,
      headers: {
        authorization: 'authorization-text',
      },
      columns,
      innerColumns,
      dataSource,
      editableData,
      count,
      edit,
      save,
      moveUp,
      moveDown
    }
        ;
  },
});
</script>
<style lang="less">
.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>