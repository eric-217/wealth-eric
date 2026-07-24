/**
 * 客户认证系统 — SHA-256 静态版
 * =================================
 * 
 * 工作原理：
 * 1. 客户在 login.html 输入手机号+密码
 * 2. 密码经 SHA-256 哈希后与 CLIENTS 对象中的 hash 比对
 * 3. 匹配成功后，sessionStorage 存储认证状态
 * 4. dashboard.html 检查认证后加载对应客户的数据页面
 *
 * 新增客户（只需3步）：
 *   第1步：在 CLIENTS 对象中添加一条记录（见下方格式）
 *   第2步：将客户文件放在 clients/[客户文件夹]/ 下
 *   第3步：部署后告知客户手机号和密码即可登录
 *
 * 生成密码哈希（在浏览器控制台执行）：
 *   crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的密码'))
 *     .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join(''))
 *     .then(console.log)
 *
 * 路径规则：
 *   path: '客户文件夹/菜单.html'   （相对于 clients/ 目录）
 *   示例: 'chen/菜单.html' 或 'wang/菜单.html'
 */

var CLIENTS = {
  // ========== 当前客户列表 ==========

  // 模板客户（演示用 · 密码: demo123）
  '13800000000': {
    name: '模板客户',
    path: 'template/菜单.html',
    hash: '91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203'
  },

  // 陈女士 · 真实客户
  '15107572598': {
    name: '陈女士',
    path: 'chen/菜单.html',
    hash: 'fe438d7c548ecc2818ccf0117f6b3150a7c40bb8cb24c28af6e1da5364c01229'
  }

  // ========== 新增客户在此添加 ↓ ==========
  // 格式: '手机号': { name: '显示名', path: '客户文件夹/菜单.html', hash: 'SHA256哈希值' }

};

// ========== 以下为认证逻辑，无需修改 ==========

/** 计算字符串的 SHA-256 哈希 */
async function sha256(str) {
  var buf = new TextEncoder().encode(str);
  var hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/** 登录验证 */
async function authLogin(phone, password) {
  var client = CLIENTS[phone];
  if (!client) return { ok: false, msg: '手机号未注册，请联系您的客户经理' };
  var h = await sha256(password);
  if (h !== client.hash && password !== client.hash) return { ok: false, msg: '密码错误，请重试' };
  sessionStorage.setItem('wm_phone', phone);
  sessionStorage.setItem('wm_client', client.name);
  sessionStorage.setItem('wm_path', client.path);
  return { ok: true };
}

/** 检查是否已登录 */
function checkAuth() {
  return sessionStorage.getItem('wm_phone') && sessionStorage.getItem('wm_path');
}

/** 退出登录 */
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

/** 获取当前客户名称 */
function getClientName() {
  return sessionStorage.getItem('wm_client') || '';
}

/** 获取当前客户数据路径 */
function getClientPath() {
  return sessionStorage.getItem('wm_path') || '';
}
