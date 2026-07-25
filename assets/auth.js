/**
 * 客户认证系统 — SHA-256 静态版 + 二次验证遮罩
 * =================================
 * 
 * 工作流程：
 * 1. 每个页面加载时检查 sessionStorage 是否有认证记录
 * 2. 已认证 → 直接显示页面内容
 * 3. 未认证 → 显示验证遮罩（QR码 + 密码输入框）
 *    - QR码：扫描后在手机浏览器打开 login.html 登录
 *    - 密码框：输入手机号+密码直接验证
 * 4. 验证通过后隐藏遮罩，显示页面内容
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
  return Array.from(new Uint8Array(hash)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
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

/** 获取当前客户名称 */
function getClientName() {
  return sessionStorage.getItem('wm_client') || '';
}

/** 获取当前客户数据路径 */
function getClientPath() {
  return sessionStorage.getItem('wm_path') || '';
}

/** 退出登录 */
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// ========== 二次验证遮罩（页面守卫） ==========

/**
 * 显示验证遮罩。未登录时由页面守卫自动调用。
 * 遮罩内容：QR码（扫到手机浏览器打开 login.html） + 直接输入密码验证
 */
function showAuthGate(loginUrl) {
  // 已认证则跳过
  if (checkAuth()) return;

  // 计算 QR 码 URL（用免费API生成）
  var absLoginUrl = new URL(loginUrl, window.location.href).href;
  var qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(absLoginUrl);

  // 创建遮罩 HTML
  var overlay = document.createElement('div');
  overlay.id = '__auth_gate__';
  overlay.innerHTML =
    '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,\'PingFang SC\',\'Microsoft YaHei\',sans-serif">' +
      '<div style="background:#fff;border-radius:16px;padding:32px 28px;max-width:360px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)">' +
        '<div style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:4px">客户验证</div>' +
        '<div style="font-size:13px;color:#999;margin-bottom:20px">请通过以下任一方式验证身份</div>' +

        // 方式一：QR码
        '<div style="background:#f8f9fc;border-radius:12px;padding:16px;margin-bottom:16px">' +
          '<div style="font-size:13px;color:#666;margin-bottom:10px;font-weight:600">方式一：手机扫码登录</div>' +
          '<img src="' + qrSrc + '" alt="扫码登录" style="width:160px;height:160px;border-radius:8px;border:1px solid #e0e0e0" ' +
            'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">' +
          '<div style="display:none;font-size:12px;color:#999;padding:20px">QR码加载失败，请使用方式二</div>' +
          '<div style="font-size:11px;color:#aaa;margin-top:8px">用手机扫描后输入密码登录</div>' +
        '</div>' +

        // 分隔
        '<div style="display:flex;align-items:center;gap:10px;margin:0 0 16px">' +
          '<div style="flex:1;height:1px;background:#e8e8e8"></div>' +
          '<div style="font-size:12px;color:#bbb">或</div>' +
          '<div style="flex:1;height:1px;background:#e8e8e8"></div>' +
        '</div>' +

        // 方式二：直接输入
        '<div style="text-align:left;margin-bottom:8px">' +
          '<div style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600">方式二：直接输入密码</div>' +
          '<input id="__auth_phone__" type="tel" placeholder="手机号" maxlength="11" style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:8px;font-size:15px;box-sizing:border-box;margin-bottom:8px;outline:none;transition:border .2s" onfocus="this.style.borderColor=\'#1a3a5c\'" onblur="this.style.borderColor=\'#ddd\'">' +
          '<input id="__auth_pwd__" type="password" placeholder="密码" style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:8px;font-size:15px;box-sizing:border-box;margin-bottom:8px;outline:none;transition:border .2s" onfocus="this.style.borderColor=\'#1a3a5c\'" onblur="this.style.borderColor=\'#ddd\'" onkeydown="if(event.key===\'Enter\')doAuthGateVerify()">' +
          '<div id="__auth_err__" style="font-size:12px;color:#e53e3e;min-height:18px;margin-bottom:4px"></div>' +
        '</div>' +

        '<button onclick="doAuthGateVerify()" style="width:100%;padding:14px;background:#1a3a5c;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s" ' +
          'onmouseover="this.style.background=\'#0f2440\'" onmouseout="this.style.background=\'#1a3a5c\'">验证进入</button>' +

        '<div style="font-size:11px;color:#ccc;margin-top:14px">© 2026 财富管理规划 · 仅限授权客户访问</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  // 隐藏 body 内原有内容防止闪动（CSS 未加载前）
  document.body.style.display = 'block';

  // 自动聚焦
  setTimeout(function(){ var el=document.getElementById('__auth_phone__'); if(el)el.focus(); }, 300);
}

/** 验证遮罩中的密码输入 */
async function doAuthGateVerify() {
  var phone = document.getElementById('__auth_phone__').value.trim();
  var pwd = document.getElementById('__auth_pwd__').value;
  var err = document.getElementById('__auth_err__');

  if (!phone) { err.textContent = '请输入手机号'; return; }
  if (!pwd) { err.textContent = '请输入密码'; return; }

  var r = await authLogin(phone, pwd);
  if (!r.ok) { err.textContent = r.msg; return; }

  // 验证通过，移除遮罩
  var gate = document.getElementById('__auth_gate__');
  if (gate) gate.remove();
}

// ========== 页面守卫（自动执行） ==========
(function(){
  var loginUrl = window.__AUTH_LOGIN_URL__;
  if (loginUrl && !checkAuth()) {
    // 立即隐藏页面内容，防止未认证内容闪烁
    var style = document.createElement('style');
    style.id = '__auth_hide__';
    style.textContent = 'html{visibility:hidden}';
    document.head.appendChild(style);
    // 等 DOM 就绪后显示遮罩
    var show = function(){
      showAuthGate(loginUrl);
      // 遮罩加载后恢复页面可见（遮罩在最上层）
      var s = document.getElementById('__auth_hide__');
      if(s) s.textContent = '';
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }
})();
