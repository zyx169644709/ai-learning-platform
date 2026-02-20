# Composables 使用文档

本目录包含了可复用的 Vue 3 Composition API 函数（composables），用于简化常见的 CRUD 操作和 UI 交互。

## 📦 可用的 Composables

### 1. `useCrud` - 通用 CRUD 操作

用于处理创建、读取、更新、删除操作的通用 composable。

#### 使用示例

```typescript
import { useCrud } from '@/composables/useCrud'

const {
  items,              // 数据列表
  filterForm,         // 筛选表单
  showViewDialog,     // 查看对话框状态
  showEditDialog,     // 编辑对话框状态
  selectedItem,       // 当前选中的项目
  editingItem,        // 正在编辑的项目
  saving,             // 保存状态
  formRef,            // 表单引用
  loadItems,          // 加载列表
  viewItem,           // 查看详情
  editItem,           // 编辑项目
  saveItem,           // 保存项目
  deleteItem,         // 删除项目
  batchDelete         // 批量删除
} = useCrud({
  apiPath: '/admin/users',           // API 路径
  resourceName: '用户',               // 资源名称（用于提示信息）
  filterFields: ['name', 'email']    // 筛选字段
})
```

#### 配置选项

- `apiPath`: API 端点路径（必填）
- `resourceName`: 资源名称，用于错误提示（必填）
- `filterFields`: 筛选字段数组（可选，默认为空数组）

#### 主要方法

**loadItems(paginationParams, extraParams?)**
- 加载数据列表
- 参数：
  - `paginationParams`: 分页参数对象
  - `extraParams`: 额外的查询参数（可选）
- 返回：`{ items, total }`

**editItem(item, form)**
- 打开编辑对话框
- 参数：
  - `item`: 要编辑的项目（null 表示创建新项目）
  - `form`: 表单对象

**saveItem(form, callback)**
- 保存项目（创建或更新）
- 参数：
  - `form`: 表单数据
  - `callback`: 保存成功后的回调函数

**deleteItem(id, callback)**
- 删除单个项目
- 参数：
  - `id`: 项目 ID
  - `callback`: 删除成功后的回调函数

---

### 2. `usePagination` - 分页管理

处理分页逻辑的 composable。

#### 使用示例

```typescript
import { usePagination } from '@/composables/usePagination'

const {
  pagination,           // 分页对象 { page, limit }
  resetPagination,      // 重置分页
  setTotal,            // 设置总数
  getPaginationParams  // 获取分页参数
} = usePagination()
```

---

### 3. `useConfirm` - 确认对话框

提供各种确认对话框的 composable。

#### 使用示例

```typescript
import { useConfirm } from '@/composables/useConfirm'

const {
  confirmDelete,        // 删除确认
  confirmArchive,       // 归档确认
  confirmDisable,       // 禁用确认
  confirmResetPassword  // 重置密码确认
} = useConfirm()

// 使用
if (await confirmDelete('该用户')) {
  // 执行删除操作
}
```

---

### 4. `useTableActions` - 表格操作

处理表格选择和批量操作的 composable。

#### 使用示例

```typescript
import { useTableActions } from '@/composables/useTableActions'

const {
  selectedItems,         // 选中的项目列表
  handleSelectionChange, // 处理选择变化
  clearSelection,        // 清空选择
  getSelectedIds         // 获取选中的 ID 列表
} = useTableActions()
```

---

### 5. `useFilter` - 筛选和防抖

提供带防抖的搜索功能。

#### 使用示例

```typescript
import { useFilter } from '@/composables/useFilter'

const { debouncedSearch } = useFilter({
  onSearch: () => {
    resetPagination()
    loadUsers()
  },
  debounceDelay: 500  // 可选，默认 500ms
})

// 在输入框中使用
<el-input @input="debouncedSearch" />
```

---

## 🎯 完整示例：用户管理页面

```vue
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { usePagination } from '@/composables/usePagination'
import { useConfirm } from '@/composables/useConfirm'
import { useCrud } from '@/composables/useCrud'
import { useTableActions } from '@/composables/useTableActions'
import { useFilter } from '@/composables/useFilter'

// 使用分页
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 使用确认对话框
const { confirmDelete } = useConfirm()

// 使用 CRUD
const {
  items: users,
  filterForm,
  showEditDialog,
  saving,
  formRef,
  loadItems,
  editItem,
  saveItem,
  deleteItem
} = useCrud({
  apiPath: '/admin/users',
  resourceName: '用户',
  filterFields: ['name', 'email', 'role']
})

// 使用表格操作
const { selectedItems, handleSelectionChange } = useTableActions()

// 编辑表单
const editForm = reactive({
  name: '',
  email: '',
  role: ''
})

// 加载用户列表
const loadUsers = async () => {
  const result = await loadItems(getPaginationParams())
  setTotal(result.total)
}

// 使用筛选
const { debouncedSearch } = useFilter({
  onSearch: () => {
    resetPagination()
    loadUsers()
  }
})

// 编辑用户
const editUser = (user: any) => {
  Object.assign(editForm, user)
  editItem(user, editForm)
}

// 保存用户
const saveUser = async () => {
  await saveItem(editForm, loadUsers)
}

// 删除用户
const handleDelete = async (user: any) => {
  if (await confirmDelete('该用户')) {
    await deleteItem(user.id, loadUsers)
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

---

## 📝 最佳实践

### 1. 命名规范
- 使用 `items` 作为列表数据的别名（如 `items: users`）
- 加载函数命名为 `load[ResourceName]s`（如 `loadUsers`）
- 编辑表单命名为 `[resource]Form`（如 `editForm`）

### 2. 组合使用
通常一个 CRUD 页面会组合使用以下 composables：
- `usePagination` - 分页
- `useConfirm` - 确认对话框
- `useCrud` - CRUD 操作
- `useTableActions` - 表格选择（如果需要批量操作）
- `useFilter` - 搜索防抖（如果有实时搜索）

### 3. 回调函数
所有修改数据的操作（保存、删除等）都应该在回调中重新加载列表：
```typescript
await saveItem(editForm, loadUsers)  // ✅ 正确
await deleteItem(id, loadUsers)      // ✅ 正确
```

### 4. 表单重置
使用 `editItem(null, form)` 创建新项目时，会自动重置表单：
```typescript
const createUser = () => {
  editItem(null, editForm)  // 自动重置表单并打开对话框
}
```

---

## 🔧 扩展和自定义

如果需要自定义行为，可以：

1. **扩展 useCrud**：在页面中添加额外的方法
2. **覆盖默认行为**：使用自己的实现替代 composable 提供的方法
3. **组合多个 composables**：根据需要组合使用

---

## 🐛 常见问题

### Q: 为什么 filterForm 是响应式的？
A: `useCrud` 内部使用 `reactive` 创建 filterForm，可以直接修改属性值。

### Q: 如何添加自定义筛选逻辑？
A: 在调用 `loadItems` 时传入额外参数：
```typescript
const loadUsers = async () => {
  const result = await loadItems(getPaginationParams(), {
    customField: 'customValue'
  })
  setTotal(result.total)
}
```

### Q: saveItem 不支持我的表单验证规则？
A: `saveItem` 使用 `formRef.value.validate()`，确保你的表单规则正确配置。

---

## 📚 相关文件

- `useCrud.ts` - CRUD 操作
- `usePagination.ts` - 分页管理
- `useConfirm.ts` - 确认对话框
- `useTableActions.ts` - 表格操作
- `useFilter.ts` - 筛选防抖

---

**更新时间**: 2026-02-17
