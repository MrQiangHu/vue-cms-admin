<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:15px;">
      <el-input v-model="listQuery.userid" placeholder="代理ID" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.ipadress" placeholder="窗口IP" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.cpuid" placeholder="窗口CPUID" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.version" placeholder="窗口软件版本号" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;">
        自动刷新
      </el-checkbox>
      当前窗口总数：
      <countTo :start-val="0" :end-val="total" :duration="3000" />
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
        <template>
          <span>{{ tableKey+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="窗口对应代理ID" min-width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.USERID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="窗口对应IP" min-width="200px">
        <template slot-scope="{row}">
          <span class="link-type" />
          <el-tag>{{ row.CLIENTIP }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="窗口对应CPU（标明是不是同一台电脑）" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.CPUID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="窗口对应软件版本" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.VERSION }}</span>
        </template>
      </el-table-column>
      <el-table-column label="窗口对应服务器端口" min-width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row._sockname.port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="窗口连接时间" align="center" min-width="130px">
        <template slot-scope="{row}">
          <span>{{ new Date(row.TIME) }}</span>
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
        <el-form-item label="权限名称" prop="rolename">
          <el-input v-model="temp.rolename" placeholder="请输入权限别名" />
        </el-form-item>
        <el-form-item label="代理地址" prop="address">
          <el-input v-model="temp.rolename" placeholder="请输入代理的地址" />
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSetVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSet">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { SocketList, fetchPv, createArticle, updateArticle, updateStatus } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import md5 from 'js-md5'
import countTo from 'vue-count-to'

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
  components: { Pagination, countTo },
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
        userid: undefined,
        cpuid: undefined,
        version: undefined,
        ipadress: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: ['所有', '成功', '0支付失败：网页加载失败', '支付2：此商品已无法购买, 或已下架', '支付5：支付金额大于最大购买金额', '购买的账号没钱', '银行卡没钱', '其他情况'],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['允许', '停用'],
      showReviewer: false,
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
        rolename: [{ required: true, message: '请输入权限名称', trigger: 'blur' }, { min: 1, trigger: 'blur' }]
      },
      downloadLoading: false,
      dialogSetVisible: false,
      currObj: {
        id: '',
        status: ''
      }
    }
  }, beforeCreate() {
    setInterval(() => {
      if (this.showReviewer) {
        this.getList()
      }
    }, 2000)
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      SocketList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
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
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
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
    },
    seting(id, index) {
      // 弹出设置框
      this.currObj.id = id
      this.currObj.status = this.list[index ].status
      this.dialogSetVisible = true
    },
    submitSet() {
      updateStatus('user.update', 'updateStatusById', { id: this.currObj.id, status: this.currObj.status }).then(response => {
        if (response.code === 0) {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.getList()
          this.dialogSetVisible = false
        } else {
          this.$message.error('修改失败！')
        }
      })
    }
  }
}
</script>
