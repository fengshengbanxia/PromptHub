# PromptHub - 提示词管理系统

PromptHub是一个简单高效的提示词管理系统，基于Cloudflare全栈部署。使用Cloudflare Pages部署前端，Workers部署后端，KV存储数据。

## 项目结构

- `/prompthub`：前端React应用
- `/prompthub-api`：后端Cloudflare Workers API

## 功能特点

- **提示词管理**
  - 提示词列表展示，按添加时间排序
  - 搜索框支持关键词快速查找
  - 标签系统支持分类筛选

- **提示词详情**
  - 查看完整提示词内容
  - 提示词描述和标签展示
  - 一键复制提示词
  - 编辑和删除功能

- **添加提示词**
  - 输入标题、提示词内容、描述、标签
  - 实时表单验证

- **用户体验优化**
  - 响应式设计，适配移动端和桌面端
  - 简洁直观的界面
  - 数据导入导出功能

## 技术栈

- **前端**：React + Tailwind CSS
- **后端**：Cloudflare Workers
- **数据存储**：Cloudflare KV
- **部署**：Cloudflare Pages

## 开发指南

请参阅 [前端README](./prompthub/README.md) 和 [后端README](./prompthub-api/README.md) 获取详细的开发指南。

## 许可证

MIT


我来帮您配置GitHub Actions以自动部署您的Cloudflare Workers后端。按照以下步骤操作：

1. 首先，在您的GitHub仓库中创建`.github/workflows`目录结构（如果还不存在）

2. 然后在该目录中创建一个用于部署Workers的工作流文件

以下是完整的步骤：

```bash
mkdir -p .github/workflows
```
现在创建GitHub Actions工作流文件：

```yaml:.github/workflows/deploy-worker.yml
name: Deploy Worker

on:
  push:
    branches:
      - main  # 如果您的主分支是master，请修改这里
    paths:
      - 'prompthub-api/**'  # 只有当后端代码发生变化时才触发部署

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install Wrangler
        run: npm install -g wrangler
      
      - name: Publish Worker
        working-directory: ./prompthub-api
        run: wrangler publish
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```
很好，现在您需要在GitHub仓库中设置CLOUDFLARE_API_TOKEN密钥。以下是获取Cloudflare API令牌并添加到GitHub Secrets的步骤：

1. **获取Cloudflare API令牌**：
   - 登录您的Cloudflare账户
   - 点击右上角的个人头像 → "我的个人资料"
   - 在左侧菜单中，点击"API令牌"
   - 点击"创建令牌"
   - 选择"使用模板" → "编辑Cloudflare Workers"
   - 根据需要调整权限（至少需要Worker Script的编辑权限和KV存储的读写权限）
   - 设置令牌名称（如"PromptHub Worker Deployment"）
   - 点击"创建令牌"
   - 复制生成的令牌（只会显示一次！）

2. **将API令牌添加到GitHub Secrets**：
   - 打开您的GitHub仓库
   - 点击"Settings" → "Secrets and variables" → "Actions"
   - 点击"New repository secret"
   - 名称填写：`CLOUDFLARE_API_TOKEN`
   - 值填写：刚才复制的Cloudflare API令牌
   - 点击"Add secret"保存

3. **确保您的主分支名称正确**：
   - 如果您的主分支名不是`main`而是`master`或其他名称，请修改`.github/workflows/deploy-worker.yml`文件中的分支名称

设置完成后，以下场景会触发Workers自动部署：

1. 当您将更改推送到主分支（根据配置的是`main`）
2. 且更改包含`prompthub-api`目录中的文件

每次部署后，GitHub Actions会显示部署日志，您可以在GitHub仓库的"Actions"选项卡中查看部署状态和详情。

如果您希望立即测试此配置，可以对`prompthub-api`中的任何文件进行一个小的更改（比如在README.md中添加一个空格），然后推送到GitHub，这将触发自动部署流程。

配置Cloudflare Pages与GitHub自动部署的步骤如下：

1. **登录Cloudflare仪表板**：
   - 登录您的Cloudflare账户
   - 进入"Pages"选项卡

2. **创建新项目**：
   - 点击"Create a project"或"创建项目"按钮
   - 选择"Connect to Git"选项

3. **连接到GitHub**：
   - 如果尚未连接，系统会提示您授权Cloudflare访问您的GitHub账户
   - 授权后，选择包含PromptHub项目的GitHub仓库

4. **配置构建设置**：
   - **项目名称**：输入"prompthub-biu"或您希望的名称（这将成为您网站URL的一部分）
   - **生产分支**：选择您的主分支（通常是`main`或`master`）
   - **构建设置**：
     - **构建命令**：`cd prompthub && npm install && npm run build`
     - **构建输出目录**：`prompthub/dist`
   - **环境变量**（可选）：
     - 如需设置，添加`VITE_API_URL`为您的Workers URL（例如：https://prompthub-api.workers.dev）

5. **点击"保存并部署"**：
   - Cloudflare将开始第一次构建和部署
   - 您可以在页面上查看构建日志

6. **部署完成后**：
   - 您会获得一个`https://prompthub-biu.pages.dev`格式的URL
   - 这个URL就是您的前端应用访问地址

7. **设置自定义域名**（可选）：
   - 如果您有自己的域名，可以在项目设置中的"Custom domains"部分添加
   - 按照Cloudflare提供的说明配置DNS记录

### 后续更新流程

设置完成后，每次您推送更改到GitHub仓库的主分支时：
- Cloudflare Pages会自动检测更改
- 触发新的构建流程
- 成功后自动部署更新的网站

您可以在Cloudflare Pages仪表板查看每次部署的状态、日志以及部署历史记录。如果构建失败，可以通过日志查看错误原因并修复。

这样配置后，您的整个工作流将实现全自动化：
- 前端代码更改 → 自动部署到Cloudflare Pages
- 后端代码更改 → 通过GitHub Actions自动部署到Cloudflare Workers


 "Access-Control-Allow-Origin": "*", // 或替换为你的pages项目url

 ## 界面展示
 ![image.png](https://tgpicture.6666689.xyz/file/1744364209200_image.png)
 ![image.png](https://tgpicture.6666689.xyz/file/1744364209200_image.png)
 ![image](https://github.com/user-attachments/assets/85ba91b3-1e1d-40c2-af86-3c5aa0ec0a38)


# 最后最阴的是，我懒得写README了，自己看着3个
[前端README](./prompthub/README.md) 和 [后端README](./prompthub-api/README.md) 


