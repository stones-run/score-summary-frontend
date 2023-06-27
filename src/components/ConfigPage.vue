<template>
  <div v-show="!isLogin">
    配置界面用于修改数据，为保安全，请登陆后进行操作
  </div>
  <div v-show="isLogin">
    <a-modal v-model:visible="addExamVisible" :footer="null" title="又考试了" width="400px">
      <a-form>
        <a-form-item :label-col="{span:5}"
                     label="叫啥来着：">
          <a-input v-model:value="newExamName">
          </a-input>
        </a-form-item>

        <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
          <a-button html-type="submit" type="primary" @click="handleAdd">好吧</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-button class="editable-add-btn"
              style="margin-bottom: 8px"
              type="primary"
              @click="addExamVisible=true">
      增加考试
    </a-button>
    <!--    <a-button class="editable-add-btn" style="margin-bottom: 8px" type="primary" @click="handleAdd">增加考试</a-button>-->
    <a-divider type="vertical"/>
    <a-button :loading="isSaving" class="editable-add-btn" style="margin-bottom: 8px" type="primary" @click="saveExam">
      保存
    </a-button>
    <a-table :columns="columns" :data-source="dataSource" bordered row-key="id">
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
          <a-button size="small" style="margin-right: 8px" @click="moveUp(record.id)">
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
                  ref="uploadRef"
                  :before-upload="beforeUpload"
                  :headers="headers"
                  :multiple="true"
                  name="file"
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
  </div>

</template>

<script>
import {computed, defineComponent, reactive, ref} from 'vue';
import {CheckOutlined, DownOutlined, EditOutlined, UploadOutlined, UpOutlined} from '@ant-design/icons-vue';
import {cloneDeep} from 'lodash-es';
import {getExcelData} from "@/utils/scoreExcel";
import {mapGetters} from "vuex";
import {notification} from 'ant-design-vue';

export default defineComponent({
  components: {
    CheckOutlined,
    EditOutlined,
    UpOutlined,
    DownOutlined,
    UploadOutlined
  },
  computed: {
    ...mapGetters([
      "isLogin"
    ])
  },

  data() {
    return {
      uploadData: [],
      uploadExcel: [],
      updateExam: {},
      addExamVisible: false,
      newExamName: "",
      isSaving: false,
      dataError: false,
    }
  },
  created() {
    this.getExamData()
  },
  watch: {
    dataSource() {
      this.$store.commit("exam", this.dataSource)
    }
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
      })
    },

    onDelete(key) {
      this.$axios.delete("/api/exam/" + key).then(res => {
        res = res.data
        if (res.cd === 0) {
          this.dataSource = this.dataSource.filter((item) => item.id !== key);
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleAdd() {
      if (!this.newExamName || this.newExamName.trim().length === 0) {
        this.$message.info("请输入名称")
        return
      }
      if (!this.dataSource) {
        this.dataSource = []
      }
      const newData = {
        name: this.newExamName,
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
          this.addExamVisible = false
        } else {
          this.$message.error(res.msg)
        }
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
                console.log(file.name, 'file.name')
                const fileName = file.name;
                const match = fileName.match(/\d+/);
                if (!match) {
                  this.dataError = true
                  this.openNotification(fileName, `EXCEL名称应为阿拉伯数字的班级名`)
                } else {
                  let class_ = parseInt(match[0])
                  let cache_key = `${examId} + ${grade} + ${class_}`
                  const excelData = getExcelData(result, examId, grade, class_, this.cacheData[cache_key], this.cacheName[cache_key]);
                  if (typeof excelData === "string") {
                    this.openNotification(fileName, excelData)
                    this.dataError = true
                    return
                  }
                  this.cacheData[cache_key] = excelData
                  this.cacheName[cache_key] = fileName
                  // this.data.score = [...this.data.score, ...excelData];
                }
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
      this.isSaving = true
      this.data = {
        exam: this.dataSource,
        score: [],
        update: {
          grade: [],
          exam_id: []
        }
      }
      this.cacheData = {}
      this.cacheName = {}
      this.dataError = false
      await this.readFiles();
      if (this.dataError) {
        return
      }
      this.data.score = Object.values(this.cacheData).flat()
      this.$axios.post("/api/score", this.data).then(res => {
        this.isSaving = false
        if (res.data.cd === 0) {
          this.$message.info("保存成功")
          this.getExamData()
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    handleChange(info, examId, grade) {
      grade += 1
      console.log("info.file.status", info, examId, grade)
      let uploadExcel = this.uploadExcel.filter(data => data.grade === grade && data.examId === examId)
      if (uploadExcel && uploadExcel.length > 0) {
        uploadExcel[0].fileList = info.fileList
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
    const openNotification = (title, desc) => {
      notification.error({
        message: title,
        description: desc,
        duration: null,
        style: {
          width: '600px',
          marginLeft: `${335 - 600}px`,
          color: "red"
        },
      });
    }


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
      moveDown,
      openNotification
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