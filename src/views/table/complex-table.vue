<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:15px;">
      <el-input v-model="listQuery.phone" placeholder="手机号查询" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.userid" placeholder="代理ID查询" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.name" placeholder="代理名称" style="width: 200px;" class="filter-item" />
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
        添加代理
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
      <el-table-column label="代理名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理手机号" width="200px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag>{{ row.phone }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代理ID" width="400px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理地址" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理QQ" align="center" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.qq }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理状态" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理权限名称" class-name="status-col" width="260">
        <template slot-scope="{row}">
          <span>{{ row.rolename }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期内总订单数（成功）" class-name="status-col" width="260">
        <template slot-scope="{row}">
          <span class="link-type" />
          <el-tag>{{ row.numtotal?row.numtotal:0 }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="拼多多窗口数" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.pdd_num }}</span>
        </template>
      </el-table-column>
      <el-table-column label="剩余点数" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dianshu }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否扣点版" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.isKoudian?row.isKoudian:'否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="id">
          <el-button type="success" icon="el-icon-setting" @click="czFun(list[id.$index].id,id.$index)">充值</el-button>
          <el-button type="primary" icon="el-icon-setting" @click="handleUpdate(list[id.$index])">修改</el-button>
          <el-button type="warning" icon="el-icon-setting" @click="seting(list[id.$index].id,id.$index)">设置</el-button>
          <el-button type="danger" icon="el-icon-setting" @click="delteUser(list[id.$index].id)">删除</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="代理名称" prop="username">
          <el-input v-model="temp.username" placeholder="请输入代理名称" />
        </el-form-item>
        <el-form-item label="代理手机号" prop="phone">
          <el-input v-model="temp.phone" placeholder="请输入代理手机号" />
        </el-form-item>
        <el-form-item label="代理ID" prop="userid">
          <el-input v-model="temp.userid" readonly="readonly" placeholder="请点击生成ID" />
          <el-button @click="md5Id()">生成ID</el-button>
        </el-form-item>
        <el-form-item label="代理QQ" prop="qq">
          <el-input v-model="temp.qq" placeholder="请输入QQ" />
        </el-form-item>
        <el-form-item label="代理状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否扣点版" prop="isKoudian">
          <el-select v-model="temp.isKoudian" class="filter-item" placeholder="请选择">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限名称" prop="rolename">
          <el-select v-model="temp.rolename" class="filter-item" placeholder="请选择">
            <el-option label="普通用户权限" value="user" />
            <el-option label="管理员权限" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理地址" prop="address">
          <el-input v-model="temp.address" placeholder="请输入代理的地址" />
        </el-form-item>
        <el-form-item label="拼多多窗口数" prop="pdd_num">
          <el-select v-model="temp.pdd_num" placeholder="请设置是否允许连接服务器">
            <el-option label="0" value="0" default="default" />
            <el-option label="1" value="1" />
            <el-option label="2" value="2" />
            <el-option label="3" value="3" />
            <el-option label="4" value="4" />
            <el-option label="5" value="5" />
            <el-option label="6" value="6" />
            <el-option label="7" value="7" />
            <el-option label="8" value="8" />
            <el-option label="9" value="9" />
            <el-option label="10" value="10" />
          </el-select>
        </el-form-item>
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
    <!--这是配置状态的dialog-->
    <el-dialog title="设置服务器配置" :visible.sync="dialogSetVisible">
      <el-form :model="currObj">
        <el-form-item label="请设置是否允许连接服务器">
          <el-select v-model="currObj.status" placeholder="请设置是否允许连接服务器">
            <el-option label="允许" value="允许" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="拼多多窗口数" prop="pdd_num">
          <el-select v-model="currObj.pdd_num" placeholder="请设置是否允许连接服务器">
            <el-option label="0" value="0" />
            <el-option label="1" value="1" />
            <el-option label="2" value="2" />
            <el-option label="3" value="3" />
            <el-option label="4" value="4" />
            <el-option label="5" value="5" />
            <el-option label="6" value="6" />
            <el-option label="7" value="7" />
            <el-option label="8" value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否扣点版" prop="isKoudian">
          <el-select v-model="currObj.isKoudian" class="filter-item" placeholder="请选择">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSetVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSet">确 定</el-button>
      </div>
    </el-dialog>
    <!--这是重置界面的dialog-->
    <el-dialog title="点数充值" :visible.sync="dialogCZVisible">
      <el-form ref="czObj" :model="czObj">
        <el-form-item label="现有数量" prop="address">
          <el-input v-model="czObj.dianshu" readonly="readonly" placeholder="现有数量" />
        </el-form-item>
        <el-form-item
          prop="addDianshu"
          label="充值数量"
          :rules="[
            { required: true, message: '充值点数不能为空'},
            { type: 'number', message: '充值点数必须为数字值'}
          ]"
        >
          <el-input v-model.number="czObj.addDianshu" type="number" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="操作者标识"
          prop="rolename"
          placeholder="操作者标识"
          :rules="[
            { required: true, message: '操作者标识不能为空'}
          ]"
        >
          <el-input v-model="czObj.rolename" placeholder="操作者标识" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCZVisible = false">取 消</el-button>
        <el-button type="primary" @click="czsubmitSet">充 值</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateStatus, deleteUser } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'js-md5'

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
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
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
        phone: '',
        userid: '',
        qq: '',
        rolename: '',
        status: '允许',
        address: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改信息',
        create: '添加代理'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        // type: [{ required: true, message: 'type is required', trigger: 'change' }],
        // timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        phone: [{ required: true, message: '请输入手机号码!', trigger: 'blur' }, { min: 10, max: 12, message: '手机号长度为11位', trigger: 'blur' }],
        username: [{ required: true, message: '请输入代理名称', trigger: 'blur' }, { min: 1, max: 12, trigger: 'blur' }],
        userid: [{ required: true, message: '请生成代理ID', trigger: 'change' }, { min: 1, trigger: 'change' }],
        address: [{ required: true, message: '请输入代理地址', trigger: 'blur' }, { min: 1, trigger: 'blur' }],
        qq: [{ required: true, message: '请输入代理QQ', trigger: 'blur' }, { min: 1, trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }, { min: 1, trigger: 'change' }],
        rolename: [{ required: true, message: '请输入权限名称', trigger: 'blur' }, { min: 1, trigger: 'blur' }],
        pdd_num: [{ required: true, message: '请输入拼多多窗口数', trigger: 'blur' }, { min: 1, trigger: 'change' }],
        isKoudian: [{ required: true, message: '请选择是否为扣点版', trigger: 'blur' }, { min: 1, trigger: 'blur' }]
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
      fetchList(this.listQuery).then(response => {
        this.list = response.data.item
        this.total = response.data.total.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    md5Id() {
      if (this.temp.phone && this.temp.phone !== '') {
        // 用手机进行加密就行
        this.temp.userid = md5(this.temp.phone).toUpperCase()
        this.$forceUpdate()
      }
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
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '提交成功！',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.temp.pdd_num = this.temp.pdd_num ? this.temp.pdd_num + '' : 0 + ''
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          deleteUser('user.update', 'updateUserInfo', tempData).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.$message({
                type: 'success',
                message: '修改成功!'
              })
              this.getList()
            } else {
              this.$message.error('修改失败！')
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
    }, delteUser(id, index) {
      // 弹出设置框
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        deleteUser('user.update', 'deleteUserById', { id: id }).then(response => {
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
