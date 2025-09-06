# GitHub仓库设置指南

## 创建GitHub仓库步骤

### 1. 创建新仓库
1. 登录GitHub账户
2. 点击右上角的"+"按钮，选择"New repository"
3. 仓库名称必须设置为：`shortcut-color-plugin`（与插件名一致）
4. 描述：`A SiYuan plugin for quick text formatting with custom colors and shortcuts`
5. 设置为Public（公开仓库）
6. 勾选"Add a README file"
7. 选择MIT License
8. 点击"Create repository"

### 2. 初始化本地仓库并推送代码

在插件目录下执行以下命令：

```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Shortcut Color Plugin v0.4.2"

# 设置主分支名称
git branch -M main

# 添加远程仓库地址
git remote add origin https://github.com/zhongjiahao/shortcut-color-plugin.git

# 推送代码到GitHub
git push -u origin main
```

### 3. 验证仓库设置

推送成功后，检查以下内容：
- [ ] 仓库名称：`shortcut-color-plugin`
- [ ] 默认分支：`main`
- [ ] 包含所有必要文件：
  - [ ] `plugin.json`
  - [ ] `package.json`
  - [ ] `README.md`
  - [ ] `README_zh_CN.md`
  - [ ] `icon.png`
  - [ ] `preview.png`
  - [ ] `src/` 目录
  - [ ] `dist/` 目录（构建后）

## 常见问题解决

### 问题1：推送时要求认证
**解决方案：**
1. 使用Personal Access Token (推荐)
2. 或配置SSH密钥

### 问题2：仓库名称不匹配
**解决方案：**
- 确保GitHub仓库名与`plugin.json`中的`name`字段完全一致
- 仓库名：`shortcut-color-plugin`

### 问题3：分支名称问题
**解决方案：**
- 确保默认分支是`main`而不是`master`
- 使用命令：`git branch -M main`

## 后续维护

### 版本更新流程
1. 修改代码
2. 更新版本号（plugin.json 和 package.json）
3. 构建：`pnpm run build`
4. 提交代码：
   ```bash
   git add .
   git commit -m "Release v0.4.3: 更新说明"
   git push
   ```
5. 创建GitHub Release
6. 上传`package.zip`

### 创建Release
1. 进入GitHub仓库页面
2. 点击"Releases" → "Create a new release"
3. Tag version: `v0.4.2`
4. Release title: `v0.4.2`
5. 描述更新内容
6. 上传`package.zip`文件
7. 点击"Publish release"

## 重要提醒

1. **仓库必须是公开的**（Public）
2. **仓库名必须与插件名一致**
3. **默认分支必须是main**
4. **确保plugin.json中的url字段正确**

当前配置：
- 仓库地址：`https://github.com/zhongjiahao/shortcut-color-plugin`
- 插件名称：`shortcut-color-plugin`
- 作者：`zhongjiahao`
