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


