// ============================================================================
// 校途职居 — 页面切换、用户认证与交互逻辑
// ============================================================================

// 预设预览账号
var PRESET_ACCOUNTS = {
  student: { role: 'student', name: '张同学', phone: '138****0001', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  landlord: { role: 'landlord', name: '张先生', phone: '139****0002', avatar: 'https://randomuser.me/api/portraits/men/64.jpg' },
  admin: { role: 'admin', name: '管理员', phone: 'admin', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' }
};

var pageManager = {
  currentRole: 'student',
  currentUser: null, // null = guest; {role, name, phone, avatar}

  // --- 隐藏所有页面 ---
  hideAll: function() {
    document.querySelectorAll('[id$="-page"]').forEach(function(el) { el.classList.add('hidden'); });
    document.querySelectorAll('.modal-overlay').forEach(function(el) { el.classList.add('hidden'); });
  },

  // --- 显示指定页面 ---
  show: function(pageId) {
    this.hideAll();
    var el = document.getElementById(pageId);
    if (el) { el.classList.remove('hidden'); el.scrollTop = 0; }
    window.scrollTo(0, 0);
  },

  // --- 学生端页面 ---
  showStudent: function(pageId) {
    this.currentRole = 'student';
    if (!pageId.endsWith('-page')) pageId += '-page';
    this.show(pageId);
    this.updateTabBar(pageId);
  },

  // --- 房东端页面 ---
  showLandlord: function(pageId) {
    this.currentRole = 'landlord';
    if (!pageId.endsWith('-page')) pageId += '-page';
    this.show(pageId);
    this.updateLandlordSidebar(pageId);
    this.updateAdminSidebar(pageId);
  },

  // --- 管理端页面 ---
  showAdmin: function(pageId) {
    this.currentRole = 'admin';
    if (!pageId.endsWith('-page')) pageId += '-page';
    this.show(pageId);
    this.updateLandlordSidebar(pageId);
    this.updateAdminSidebar(pageId);
  },

  // --- 登录 ---
  login: function(role) {
    this.currentUser = PRESET_ACCOUNTS[role];
    this.currentRole = role;
    this.updateAuthUI();
    if (role === 'student') this.showStudent('home-page');
    else if (role === 'landlord') this.showLandlord('landlord-dashboard-page');
    else if (role === 'admin') this.showAdmin('admin-dashboard-page');
  },

  // --- 登出 ---
  logout: function() {
    this.currentUser = null;
    this.currentRole = 'student';
    this.updateAuthUI();
    this.showStudent('home-page');
  },

  // --- 是否已登录 ---
  isLoggedIn: function() { return !!this.currentUser; },

  // --- 更新认证 UI (桌面导航 + 横幅 + Tab) ---
  updateAuthUI: function() {
    var authArea = document.getElementById('desktop-auth-area');
    var guestBanner = document.getElementById('guest-banner');
    var tabProfile = document.getElementById('tab-profile');

    if (this.isLoggedIn()) {
      // 已登录: 桌面导航显示头像+姓名
      if (authArea) {
        authArea.innerHTML = '<img src="' + this.currentUser.avatar + '" alt="头像" class="avatar avatar-sm" style="cursor:pointer;">'
          + '<span class="text-sm font-medium">' + this.currentUser.name + '</span>'
          + '<span class="text-xs text-morandi-light cursor-pointer hover:text-morandi-danger ml-2" id="desktop-logout-btn">退出</span>';
        // 绑定退出事件
        var logoutBtn = document.getElementById('desktop-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', function() { pageManager.logout(); });
        // 头像点击进个人中心
        authArea.querySelector('img').addEventListener('click', function() { pageManager.showStudent('profile-page'); });
      }
      // 隐藏游客横幅
      if (guestBanner) guestBanner.style.display = 'none';
      // 移动端"我的"跳转个人中心
      if (tabProfile) { tabProfile.dataset.page = 'profile'; tabProfile.onclick = function() { pageManager.showStudent('profile-page'); }; }
    } else {
      // 未登录: 桌面显示登录按钮
      if (authArea) {
        authArea.innerHTML = '<button class="btn-outline btn-sm" id="desktop-login-btn">登录</button>';
        var loginBtn = document.getElementById('desktop-login-btn');
        if (loginBtn) loginBtn.addEventListener('click', function() { pageManager.showStudent('login-page'); });
      }
      // 显示游客横幅
      if (guestBanner) guestBanner.style.display = '';
      // 移动端"我的"跳转登录
      if (tabProfile) { tabProfile.dataset.page = 'login'; tabProfile.onclick = function() { pageManager.showStudent('login-page'); }; }
    }
  },

  // --- 底部 Tab 激活 ---
  updateTabBar: function(pageId) {
    var tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(function(item) {
      item.classList.remove('active');
      if ((item.dataset.page === 'home' && pageId === 'home-page') ||
          (item.dataset.page === 'housing-list' && (pageId === 'housing-list-page' || pageId === 'housing-detail-page' || pageId === 'housing-map-page')) ||
          (item.dataset.page === 'commute-list' && (pageId === 'commute-list-page' || pageId === 'commute-detail-page' || pageId === 'commute-publish-page')) ||
          (item.dataset.page === 'messages' && pageId === 'messages-page') ||
          (item.dataset.page === 'profile' && pageId === 'profile-page') ||
          (item.dataset.page === 'login' && pageId === 'login-page')) {
        item.classList.add('active');
      }
    });
  },

  // --- 房东侧边栏 ---
  updateLandlordSidebar: function(pageId) {
    var baseId = pageId.replace(/-page$/, '');
    document.querySelectorAll('[data-landlord-page]').forEach(function(link) {
      if (link.dataset.landlordPage === baseId) link.classList.add('active');
      else link.classList.remove('active');
    });
  },

  // --- 管理端侧边栏 ---
  updateAdminSidebar: function(pageId) {
    var baseId = pageId.replace(/-page$/, '');
    document.querySelectorAll('[data-admin-page]').forEach(function(link) {
      if (link.dataset.adminPage === baseId) link.classList.add('active');
      else link.classList.remove('active');
    });
  }
};

// ============================================================================
// 事件绑定
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {

  // ---------- 认证 UI 初始化 ----------
  pageManager.updateAuthUI();

  // ---------- 游客横幅按钮 ----------
  function bindGuestBanner() {
    var gbStudent = document.getElementById('gb-student');
    var gbLandlord = document.getElementById('gb-landlord');
    var gbAdmin = document.getElementById('gb-admin');
    var gbClose = document.getElementById('gb-close');
    if (gbStudent) gbStudent.addEventListener('click', function() { pageManager.login('student'); });
    if (gbLandlord) gbLandlord.addEventListener('click', function() { pageManager.login('landlord'); });
    if (gbAdmin) gbAdmin.addEventListener('click', function() { pageManager.login('admin'); });
    if (gbClose) gbClose.addEventListener('click', function() { document.getElementById('guest-banner').style.display = 'none'; });
  }
  bindGuestBanner();

  // ---------- 登录页预设账号 ----------
  var psStudent = document.getElementById('preset-student');
  var psLandlord = document.getElementById('preset-landlord');
  var psAdmin = document.getElementById('preset-admin');
  if (psStudent) psStudent.addEventListener('click', function() { pageManager.login('student'); });
  if (psLandlord) psLandlord.addEventListener('click', function() { pageManager.login('landlord'); });
  if (psAdmin) psAdmin.addEventListener('click', function() { pageManager.login('admin'); });

  // ---------- 登录按钮 (兼容手动输入) ----------
  var loginSubmitBtn = document.getElementById('login-submit-btn');
  if (loginSubmitBtn) loginSubmitBtn.addEventListener('click', function() {
    pageManager.show('verify-success-modal');
  });

  // ---------- 认证成功弹窗 ----------
  var closeVerifyModal = document.getElementById('close-verify-modal');
  if (closeVerifyModal) closeVerifyModal.addEventListener('click', function() {
    document.getElementById('verify-success-modal').classList.add('hidden');
    pageManager.login('student');
  });

  // ---------- 实名认证提交 ----------
  var verifySubmitBtn = document.getElementById('verify-submit-btn');
  if (verifySubmitBtn) verifySubmitBtn.addEventListener('click', function() {
    pageManager.show('verify-success-modal');
  });

  // ---------- 认证页返回 ----------
  var verifyBackBtn = document.getElementById('verify-back-btn');
  if (verifyBackBtn) verifyBackBtn.addEventListener('click', function() { pageManager.showStudent('login-page'); });

  // ---------- 桌面登录按钮 (动态生成, 用事件委托) ----------
  document.getElementById('desktop-auth-area').addEventListener('click', function(e) {
    if (e.target.id === 'desktop-login-btn' || e.target.closest('#desktop-login-btn')) {
      pageManager.showStudent('login-page');
    }
  });

  // ---------- 底部 Tab 切换 ----------
  document.querySelectorAll('.tab-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = item.dataset.page;
      var pageMap = {
        'home': 'home-page', 'housing-list': 'housing-list-page',
        'commute-list': 'commute-list-page', 'messages': 'messages-page',
        'profile': 'profile-page', 'login': 'login-page'
      };
      if (pageMap[page]) pageManager.showStudent(pageMap[page]);
    });
  });

  // ---------- data-page 属性跳转 ----------
  document.querySelectorAll('[data-page]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      var page = el.dataset.page;
      var pageMap = {
        'housing-list': 'housing-list-page', 'housing-detail': 'housing-detail-page',
        'housing-map': 'housing-map-page', 'roommate': 'roommate-page',
        'commute-list': 'commute-list-page', 'commute-detail': 'commute-detail-page',
        'commute-publish': 'commute-publish-page', 'messages': 'messages-page',
        'profile': 'profile-page', 'home': 'home-page'
      };
      if (pageMap[page]) pageManager.showStudent(pageMap[page]);
    });
  });

  // ---------- 桌面导航链接 ----------
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var nav = link.dataset.nav;
      var navMap = { 'home': 'home-page', 'housing': 'housing-list-page', 'commute': 'commute-list-page' };
      if (navMap[nav]) pageManager.showStudent(navMap[nav]);
      document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  // ---------- 页面返回按钮 ----------
  function bindBack(id, target) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', function() { pageManager.showStudent(target); });
  }
  bindBack('housing-list-back', 'home-page');
  bindBack('housing-detail-back', 'housing-list-page');
  bindBack('housing-map-back', 'housing-list-page');
  bindBack('roommate-back', 'home-page');
  bindBack('commute-list-back', 'home-page');
  bindBack('commute-publish-back', 'commute-list-page');
  bindBack('commute-detail-back', 'commute-list-page');
  bindBack('messages-back', 'home-page');

  // ---------- 收藏按钮 ----------
  var favBtn = document.getElementById('fav-house-btn');
  if (favBtn) favBtn.addEventListener('click', function() {
    var icon = this.querySelector('i');
    if (icon.classList.contains('fa-heart-o')) { icon.classList.remove('fa-heart-o'); icon.classList.add('fa-heart'); icon.style.color = '#C5837B'; }
    else { icon.classList.remove('fa-heart'); icon.classList.add('fa-heart-o'); icon.style.color = ''; }
  });

  // ---------- 合租弹窗 ----------
  var applyRoommateBtn = document.getElementById('apply-roommate-btn');
  if (applyRoommateBtn) applyRoommateBtn.addEventListener('click', function() { pageManager.show('roommate-modal'); });
  function bindModalClose(closeId, cancelId, modalId) {
    var close = document.getElementById(closeId); var cancel = document.getElementById(cancelId);
    if (close) close.addEventListener('click', function() { document.getElementById(modalId).classList.add('hidden'); });
    if (cancel) cancel.addEventListener('click', function() { document.getElementById(modalId).classList.add('hidden'); });
  }
  bindModalClose('close-roommate-modal', 'cancel-roommate-modal', 'roommate-modal');
  var confirmRoommate = document.getElementById('confirm-roommate-modal');
  if (confirmRoommate) confirmRoommate.addEventListener('click', function() { document.getElementById('roommate-modal').classList.add('hidden'); alert('申请提交成功！'); });

  // ---------- 发布合租弹窗 ----------
  var publishBtn = document.getElementById('publish-roommate-btn');
  if (publishBtn) publishBtn.addEventListener('click', function() { pageManager.show('publish-roommate-modal'); });
  bindModalClose('close-publish-roommate', 'cancel-publish-roommate', 'publish-roommate-modal');

  // ---------- 退出登录 ----------
  var studentLogoutBtn = document.getElementById('student-logout-btn');
  if (studentLogoutBtn) studentLogoutBtn.addEventListener('click', function() { pageManager.logout(); });

  // ---------- 登录页角色切换入口 ----------
  var switchLandlordLogin = document.getElementById('switch-landlord-login');
  if (switchLandlordLogin) switchLandlordLogin.addEventListener('click', function(e) { e.preventDefault(); pageManager.showLandlord('landlord-login-page'); });

  var switchAdminLogin = document.getElementById('switch-admin-login');
  if (switchAdminLogin) switchAdminLogin.addEventListener('click', function(e) { e.preventDefault(); pageManager.showAdmin('admin-login-page'); });

  var switchStudentFromLandlord = document.getElementById('switch-student-from-landlord');
  if (switchStudentFromLandlord) switchStudentFromLandlord.addEventListener('click', function(e) { e.preventDefault(); pageManager.showStudent('login-page'); });

  var switchStudentFromAdmin = document.getElementById('switch-student-from-admin');
  if (switchStudentFromAdmin) switchStudentFromAdmin.addEventListener('click', function(e) { e.preventDefault(); pageManager.showStudent('login-page'); });

  // ---------- 个人中心切换到房东端 ----------
  var switchLandlordBtn = document.getElementById('switch-landlord-btn');
  if (switchLandlordBtn) switchLandlordBtn.addEventListener('click', function() { pageManager.login('landlord'); });

  // ---------- 房东/管理端登录 ----------
  var landlordLoginBtn = document.getElementById('landlord-login-submit-btn');
  if (landlordLoginBtn) landlordLoginBtn.addEventListener('click', function() { pageManager.login('landlord'); });

  var adminLoginBtn = document.getElementById('admin-login-submit-btn');
  if (adminLoginBtn) adminLoginBtn.addEventListener('click', function() { pageManager.login('admin'); });

  // ---------- 房东侧边栏 ----------
  document.querySelectorAll('[data-landlord-page]').forEach(function(link) {
    link.addEventListener('click', function(e) { e.preventDefault(); pageManager.showLandlord(link.dataset.landlordPage + '-page'); });
  });

  // ---------- 管理端侧边栏 ----------
  document.querySelectorAll('[data-admin-page]').forEach(function(link) {
    link.addEventListener('click', function(e) { e.preventDefault(); pageManager.showAdmin(link.dataset.adminPage + '-page'); });
  });

  // ---------- 返回学生端链接 ----------
  var swLL = document.getElementById('sw-stu-from-ll-desk');
  if (swLL) swLL.addEventListener('click', function(e) { e.preventDefault(); pageManager.login('student'); });
  var swAdmin = document.getElementById('sw-stu-from-admin-desk');
  if (swAdmin) swAdmin.addEventListener('click', function(e) { e.preventDefault(); pageManager.login('student'); });

  // ---------- 筛选标签 ----------
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      var parent = this.parentElement;
      parent.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ---------- 模态背景点击关闭 ----------
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) { if (e.target === this) this.classList.add('hidden'); });
  });

  // ---------- 初始化：显示首页 ----------
  pageManager.showStudent('home-page');
});
