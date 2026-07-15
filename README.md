# 客户财富管理规划报表 · 文件架构

## 部署说明

将本文件夹上传至 **Cloudflare Pages** 即可运行。

```
上传目录: D:\workbuddy\财富管理\客户财富管理规划报表\
```

## 文件夹结构

```
客户财富管理规划报表/
│
├── index.html              ← 首页：「我的财富管理规划」+ 登录入口
├── login.html              ← 登录页：手机号 + 密码
├── dashboard.html          ← 报表页：通过认证后加载客户数据
│
├── assets/
│   ├── auth.js             ← 认证系统（所有客户账号在此配置）
│   └── style.css           ← 全局样式
│
├── clients/                ← 客户数据目录（每个客户一个子目录）
│   ├── 陈莹/               ← 陈莹（谭女士家庭）
│   │   └── 家庭财务总览_手机版.html
│   └── [新客户]/           ← 复制模板后创建
│       └── 家庭财务总览_手机版.html
│
└── README.md               ← 本文件
```

## 用户访问流程

```
打开网站 → 首页（index.html）
  → 点击「登录」
  → 登录页（login.html）输入手机号+密码
  → 验证通过 → 进入 dashboard.html
  → 页面加载该客户的数据文件（iframe嵌入）
```

## 新增客户步骤

1. 将新客户的财务报告 HTML 文件放入 `clients/[客户目录]/`
2. 在 `assets/auth.js` 的 `CLIENTS` 对象中添加一条记录：

```js
'13900000000': {
  name: '新客户名称',
  path: '新客户目录/财务报告.html',
  hash: '<SHA-256哈希>'
}
```

3. 哈希生成方式：浏览器控制台运行
```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('密码'))
  .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join(''))
```

4. 上传到 Cloudflare Pages，完成。

## 当前已配置客户

| 手机号 | 客户 | 状态 |
|------|------|------|
| 13800000000 | 谭女士家庭 | ✅ 已配置 |

## 技术说明

- **纯静态**：HTML + CSS + JS，无需后端服务器
- **认证**：Web Crypto API SHA-256（浏览器原生支持的加密标准）
- **密码不可逆**：密码以哈希存储，源码看不到明文
- **部署**：上传到 Cloudflare Pages 即可

## 未来扩展方向

- 服务号小程序版（需后端API）
- 添加短信验证码（需短信服务商）
- 添加报表定时更新机制
# trigger redeploy
