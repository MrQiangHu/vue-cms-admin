<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:15px;">
      <el-date-picker
        v-model="listQuery.time"
        type="daterange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        筛选查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加公告
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ new Date(parseInt(row.startTime)) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" min-width="200px">
        <template slot-scope="{row}">
          <el-tag>{{ new Date( parseInt(row.endTime)) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="消息内容" min-width="400px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.info.substring(0,50) }}.....</span>
        </template>
      </el-table-column>
      <el-table-column label="间隔时间" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.everyTime/1000 }}秒</span>
        </template>
      </el-table-column>
      <el-table-column label="显示时间" align="center" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.showTime/1000 }}秒</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ new Date( (row.time)) }}秒</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="id">
          <el-button type="warning" icon="el-icon-setting" @click="handleUpdate(list[id.$index])">修改</el-button>
          <el-button type="danger" icon="el-icon-setting" @click="delteUser(list[id.$index].id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" width="600px" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="时间区间" prop="time">
          <el-date-picker
            v-model="temp.time"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>
        <el-form-item label="间隔时间" prop="everyTime">
          <el-input v-model="temp.everyTime" type="number" placeholder="每间隔多少秒显示多少秒！" width="50"> <template slot="append">秒</template>
          </el-input></el-form-item>
        <el-form-item label="显示时间" prop="showTime">
          <el-input v-model="temp.showTime" type="number" placeholder="每间隔多少秒显示多少秒！" width="50"><template slot="append">秒</template>
          </el-input></el-form-item>
        <el-form-item label="显示内容" prop="info">
          <el-input
            v-model="temp.info"
            type="textarea"
            placeholder="请输入内容"
            maxlength="500"
            show-word-limit
            rows="15"
          />
        </el-form-item>

        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>显示模拟<span style="color:red;">(换行请输入回车 开头缩进请输入空格)</span></span>
          </div>
          <div style="padding-right:0px;">
            <span v-html="temp.info? temp.info.replace(/\n/g,'<br/>').replace(/\s/g,'&nbsp;&nbsp;'):''" />
          </div>
        </el-card>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { gonggao_list, fetchPv, updateStatus, deleteUser } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        time: [new Date(), new Date()]
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['允许', '停用'],
      showReviewer: false,
      dialogCZVisible: false,
      temp: {
        id: undefined,
        username: 1,
        context: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改公告',
        create: '添加公告'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        // type: [{ required: true, message: 'type is required', trigger: 'change' }],
        // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        everyTime: [{ required: true, message: '请输入间隔时间!', trigger: 'blur' }],
        showTime: [{ required: true, message: '请输入显示时间', trigger: 'blur' }],
        context: [{ required: true, message: '请输入显示内容！', trigger: 'change' }],
        info: [{ required: true, message: '请输入显示内容！', trigger: 'change' }],
        time: [{ required: true, message: '请选择时间区间！', trigger: 'change' }]
      },
      downloadLoading: false,
      dialogSetVisible: false,
      currObj: {
        id: '',
        status: '',
        pdd_num: 0,
        isKoudian: ''
      },
      czObj: {
        id: '',
        rolename: '',
        addDianshu: 0,
        dianshu: 0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      if (this.listQuery.time && this.listQuery.time.length === 2) {
        this.listQuery.time[0].setHours(0)
        this.listQuery.time[0].setMinutes(0)
        this.listQuery.time[0].setSeconds(0)
        this.listQuery.time[1].setHours(23)
        this.listQuery.time[1].setMinutes(59)
        this.listQuery.time[1].setSeconds(59)
        this.listQuery.realTime = []
        this.listQuery.realTime[0] = this.listQuery.time[0].getTime()
        this.listQuery.realTime[1] = this.listQuery.time[1].getTime()
      } else {
        this.listQuery.realTime = undefined
      }
      gonggao_list(this.listQuery).then(response => {
        this.list = response.data.item
        this.total = response.data.total.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    changeShowMoni() {
      // this.temp.moniInfo = this.temp.context
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.everyTime = this.temp.everyTime * 1000
          this.temp.showTime = this.temp.showTime * 1000
          this.temp.startTime = this.temp.time[0].getTime()
          this.temp.endTime = this.temp.time[1].getTime()

          deleteUser('system.insert', 'Gonggao', this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.$message({
                type: 'success',
                message: '添加成功!'
              })
              this.getList()
            } else {
              this.$message.error('添加失败！' + response.code)
            }
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.time = []
      this.temp.everyTime = this.temp.everyTime / 1000
      this.temp.showTime = this.temp.showTime / 1000
      this.temp.time[0] = new Date(parseInt(this.temp.startTime))
      this.temp.time[1] = new Date(parseInt(this.temp.endTime))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // const tempData = Object.assign({}, this.temp)
          this.temp.everyTime = this.temp.everyTime * 1000
          this.temp.showTime = this.temp.showTime * 1000
          this.temp.startTime = this.temp.time[0].getTime()
          this.temp.endTime = this.temp.time[1].getTime()

          deleteUser('system.update', 'updateGonggaoById', this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.$message({
                type: 'success',
                message: '修改公告成功!'
              })
              this.getList()
            } else {
              this.$message.error('修改失败！' + response.code)
            }
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    edit(id) {
      // 跳转编辑页面
    }, czFun(id, index) {
      // 弹出设置框
      this.czObj.id = id
      this.czObj.dianshu = this.list[index].dianshu ? this.list[index].dianshu : 0
      this.dialogCZVisible = true
    },
    seting(id, index) {
      // 弹出设置框
      this.currObj.id = id
      this.currObj.status = this.list[index].status
      this.currObj.pdd_num = this.list[index].pdd_num
      this.currObj.isKoudian = this.list[index].isKoudian
      this.dialogSetVisible = true
    }, delteUser(id) {
      // 弹出设置框
      this.$confirm('此操作将永久删除该公告, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        deleteUser('system.update', 'deleteGonggao', { id: id }).then(response => {
          if (response.code === 0) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getList()
          } else {
            this.$message.error('删除失败！')
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    submitSet() {
      updateStatus('user.update', 'updateStatusById', { id: this.currObj.id, status: this.currObj.status, pdd_num: this.currObj.pdd_num, isKoudian: this.currObj.isKoudian }).then(response => {
        if (response.code === 0) {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.dialogSetVisible = false
          this.getList()
        } else {
          this.$message.error('修改失败！')
        }
      })
    },
    czsubmitSet() {
      this.$refs['czObj'].validate((valid) => {
        if (valid) {
          updateStatus('user.update', 'addczrecord', { id: this.czObj.id, rolename: this.czObj.rolename, addDianshu: this.czObj.addDianshu }).then(response => {
            if (response.code === 0) {
              this.$message({
                message: '充值成功',
                type: 'success'
              })
              this.dialogCZVisible = false
              this.getList()
            } else {
              this.$message.error('充值失败！')
            }
          })
        } else {
          this.$message.error('请输入完整数据')
          return false
        }
      })
    }
  }
}
</script>

<style>
  .box-card {
    margin-left: 80px;
    width: 400px;
    height: 280px;
  }
  .el-card__body{
    padding-right: 0;
    width: 1000px;
  }
</style>
