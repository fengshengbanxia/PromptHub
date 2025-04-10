# PromptHub 手动部署指南

本文档提供了如何在Cloudflare平台上手动部署PromptHub的详细步骤，无需使用命令行工具。

## 一、准备工作

1. 注册/登录 [Cloudflare账号](https://dash.cloudflare.com)
2. 确保您已下载完整的PromptHub代码

## 二、部署Worker（后端API）

### 1. 创建KV命名空间

1. 登录Cloudflare Dashboard
2. 在左侧导航栏选择 **Workers & Pages**
3. 选择 **KV** 选项卡
4. 点击 **创建命名空间** 按钮
5. 命名为 `PROMPTS_KV` 并保存
6. **记下生成的KV命名空间ID**，后续步骤需要使用

### 2. 创建Worker

1. 回到 **Workers & Pages**
2. 点击 **创建应用程序** 按钮
3. 选择 **创建Worker**
4. 为Worker命名，例如 `prompthub-api`
5. 进入编辑界面后，删除默认代码
6. 将 `src/worker.js` 的全部内容复制粘贴到编辑器中
7. **修改CORS设置**:
   ```javascript
   // 找到这一行
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     // ...其他设置
   };
   
   // 暂时保持'*'，后续配置Pages后再修改为具体域名
   ```
8. 点击 **保存并部署** 按钮

### 3. 绑定KV到Worker

1. 部署完Worker后，在Worker详情页面
2. 点击 **设置** 选项卡，然后点击 **变量**
3. 找到 **KV命名空间绑定** 部分
4. 点击 **添加绑定**
5. 变量名填写 `PROMPTS_KV`（必须与代码中使用的名称一致）
6. 选择先前创建的KV命名空间
7. 点击 **保存** 按钮

### 4. 记下Worker URL

Worker部署完成后，会生成一个URL，格式如：
`https://prompthub-api.your-account.workers.dev`

**记下这个URL**，后续需要配置到前端代码中。

## 三、修改前端代码

在上传到Pages之前，需要修改前端代码中的API地址：

1. 打开 `public/js/app.js` 文件
2. 找到API配置部分（文件顶部）：
   ```javascript
   // API基础URL配置
   // 手动部署时，请将此处修改为你的Cloudflare Worker URL
   const API_BASE_URL = 'https://your-worker-name.workers.dev/api/';
   ```
3. 将URL替换为您的Worker URL加上'/api/'路径，例如：
   ```javascript
   const API_BASE_URL = 'https://prompthub-api.your-account.workers.dev/api/';
   ```
4. 保存文件

## 四、部署Pages（前端网站）

### 1. 创建Pages项目

1. 在Cloudflare Dashboard中，进入 **Workers & Pages**
2. 选择 **Pages** 选项卡
3. 点击 **创建应用程序**
4. 选择 **直接上传** 选项
5. 为项目命名，例如 `prompthub`
6. 点击 **上传文件** 按钮
7. 选择PromptHub项目中的 `public` 目录下的所有文件和文件夹
8. 点击 **部署站点** 按钮

### 2. 获取Pages URL

部署完成后，Pages会生成一个URL，格式如：
`https://prompthub.pages.dev`

**记下这个URL**，需要配置回Worker的CORS设置。

## 五、完成CORS配置

为了让前端能够正确调用API，需要更新Worker的CORS设置：

1. 返回Worker编辑页面
2. 找到CORS配置部分：
   ```javascript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     // ...其他设置
   };
   ```
3. 将 `'*'` 替换为您的Pages URL：
   ```javascript
   const corsHeaders = {
     'Access-Control-Allow-Origin': 'https://prompthub.pages.dev',
     // ...其他设置
   };
   ```
4. 点击 **保存并部署** 按钮

## 六、测试应用

1. 访问您的Pages URL (例如 `https://prompthub.pages.dev`)
2. 测试以下功能:
   - 添加新提示词
   - 搜索提示词
   - 编辑已有提示词
   - 删除提示词
   - 标签筛选

## 常见问题解决

### 1. API请求失败

如果前端无法成功调用API，检查:
- API_BASE_URL是否正确配置
- Worker的CORS设置是否正确
- 控制台中是否有错误信息

### 2. KV存储问题

如果数据无法保存或读取:
- 确认KV命名空间绑定名称为`PROMPTS_KV`
- 检查KV绑定是否成功配置
- 查看Worker的错误日志

### 3. 部署失败

如果Pages或Worker部署失败:
- 检查代码语法是否正确
- 查看部署日志中的错误信息
- 确保所有必要文件都已上传

## 更新和维护

如需更新应用:
1. 修改本地代码
2. 对于Worker，复制新代码到Worker编辑器中并重新部署
3. 对于Pages，重新上传修改后的文件并部署
