// 客户认证系统 · 静态版
// 新增客户：在此文件的 CLIENTS 对象中添加一条记录即可

var CLIENTS = {
  // 手机号: { password: 'SHA256哈希', name: '显示名', path: '数据文件路径' }
  '15107572598': {
    name: '陈莹',
    path: '陈莹/家庭财务总览_手机版.html',
    hash: 'fe438d7c548ecc2818ccf0117f6b3150a7c40bb8cb24c28af6e1da5364c01229'
  }
};

async function sha256(str) {
  var buf = new TextEncoder().encode(str);
  var hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function authLogin(phone, password) {
  var client = CLIENTS[phone];
  if (!client) return { ok: false, msg: '手机号未注册' };
  var h = await sha256(password);
  if (h !== client.hash && password !== client.hash) return { ok: false, msg: '密码错误' };
  sessionStorage.setItem('wm_phone', phone);
  sessionStorage.setItem('wm_client', client.name);
  sessionStorage.setItem('wm_path', client.path);
  return { ok: true };
}

function checkAuth() {
  return sessionStorage.getItem('wm_phone') && sessionStorage.getItem('wm_path');
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

function getClientName() {
  return sessionStorage.getItem('wm_client') || '';
}

function getClientPath() {
  return sessionStorage.getItem('wm_path') || '';
}
