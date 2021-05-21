<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:15px;">
      <el-input v-model="listQuery.userid" placeholder="用户ID" style="width: 200px;" class="filter-item" />
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
        搜索
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;">
        自动刷新
      </el-checkbox>
      当前总数：
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
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值数量" min-width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nums }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户的ID" min-width="300px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" />
          <el-tag>{{ row.userid }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="充值操作者" min-width="300px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" />
          <el-tag>{{ row.rolename }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="充值时间" min-width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ new Date(row.time) }}</span>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
import { czrecordList, fetchPv, createArticle, updateArticle, updateStatus } from '@/api/article'
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
        loginid: undefined,
        itemname: undefined,
        type: undefined,
        sort: '+id',
        time: [new Date(), new Date()]
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
      czrecordList(this.listQuery).then(response => {
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
      if (this.listQuery.status === '所有') {
        this.listQuery.status = ''
      }
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
