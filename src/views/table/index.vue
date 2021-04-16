<template>
  <div
    class="
  app-container"
  >
    <template slot-scope="">
      <el-button type="primary" icon="el-icon-circle-plus">新增代理</el-button>
      <div>&nbsp;</div>
    </template>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      size="medium"
    >
      <el-table-column
        fixed
        align="center"
        prop="username"
        label="代理名称"
        width="150"
      />
      <el-table-column
        prop="phone"
        label="代理手机号"
        width="120"
      />
      <el-table-column
        prop="userid"
        label="代理ID"
        width="220"
      />
      <el-table-column
        prop="address"
        label="代理地址"
        width="420"
      />
      <el-table-column
        prop="qq"
        label="代理QQ"
        width="120"
      />
      <el-table-column
        prop="status"
        label="代理状态"
        width="120"
      />
      <el-table-column
        prop="rolename"
        label="代理权限名称"
        width="120"
      />
      <el-table-column
        prop="zip"
        label="操作"
        align="left"
      >
        <template slot-scope="id">
          <el-button type="primary" icon="el-icon-edit" prop="id" @click="edit(list[id.$index].id)">编辑</el-button>
          <el-button type="warning" icon="el-icon-setting" @click="seting(list[id.$index].id,id.$index)">设置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="设置服务器配置" :visible.sync="dialogFormVisible">
      <el-form :model="currObj">
        <el-form-item label="请设置是否允许连接服务器">
          <el-select v-model="currObj.status" placeholder="请设置是否允许连接服务器">
            <el-option label="允许" value="允许" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSet">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList, updateStatus } from '@/api/table'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'

      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      dialogTableVisible: false,
      dialogFormVisible: false,
      currObj: {
        id: '',
        status: ''
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    edit(id) {
      // 跳转编辑页面
    },
    seting(id, index) {
      // 弹出设置框
      this.currObj.id = id
      this.currObj.status = this.list[index ].status
      this.dialogTableVisible = true
      this.dialogFormVisible = true
    },
    submitSet() {
      updateStatus('user.update', 'updateStatusById', { id: this.currObj.id, status: this.currObj.status }).then(response => {
        if (response.code === 0) {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.fetchData()
          this.dialogTableVisible = false
          this.dialogFormVisible = false
        } else {
          this.$message.error('修改失败！')
        }
      })
    }
  }
}
</script>
