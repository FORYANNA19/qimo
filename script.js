// ============================================================================
// 校途职居 — 页面切换、用户认证与交互逻辑
// ============================================================================

var PRESET_ACCOUNTS = {
  student: { role: 'student', name: '张同学', phone: '138****0001', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  landlord: { role: 'landlord', name: '张先生', phone: '139****0002', avatar: 'https://randomuser.me/api/portraits/men/64.jpg' },
  admin: { role: 'admin', name: '管理员', phone: 'admin', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' }
};

var pageManager = {
  currentRole: 'student',
  currentUser: null,

  hideAll: function() {
    document.querySelectorAll('[id$="-page"]').forEach(function(el) { el.classList.add('hidden'); });
    document.querySelectorAll('.modal-overlay').forEach(function(el) { el.classList.add('hidden'); });
  },

  show: function(pageId) {
    this.hideAll();
    var el = document.getElementById(pageId);
    if (el) { el.classList.remove('hidden'); el.scrollTop = 0; }
    window.scrollTo(0, 0);
    // 控制底部 Tab
    var tabBar = document.querySelector('.tab-bar');
    if (tabBar) {
      if (this.currentRole === 'student') tabBar.style.display = '';
      else tabBar.style.display = 'none';
    }
  },

  showStudent: function(pageId) {
    this.currentRole = 'student';
    if (!pageId.endsWith('-page')) pageId += '-page';
    this.show(pageId);
    this.updateTabBar(pageId);
  },

  showLandlord: function(pageId) {
    this.currentRole = 'landlord';
    if (!pageId.endsWith('-page')) pageId += '-page';
    this.show(pageId);
    this.updateLandlordSidebar(pageId);
  },

  showAdmin: function(pageId) {
    this.currentRole = 'admin';
    if (!pageId.endsWith('-page')) pageId += '-page';
    this.show(pageId);
    this.updateAdminSidebar(pageId);
  },

  login: function(role) {
    this.currentUser = PRESET_ACCOUNTS[role];
    this.currentRole = role;
    this.updateAuthUI();
    if (role === 'student') this.showStudent('home-page');
    else if (role === 'landlord') this.showLandlord('landlord-dashboard-page');
    else if (role === 'admin') this.showAdmin('admin-dashboard-page');
  },

  logout: function() {
    this.currentUser = null;
    this.currentRole = 'student';
    this.updateAuthUI();
    document.querySelector('.tab-bar').style.display = '';
    this.showStudent('home-page');
  },

  isLoggedIn: function() { return !!this.currentUser; },

  updateAuthUI: function() {
    var authArea = document.getElementById('desktop-auth-area');
    var guestBanner = document.getElementById('guest-banner');
    var tabProfile = document.getElementById('tab-profile');

    if (this.isLoggedIn()) {
      if (authArea) {
        authArea.innerHTML = '<span class="flex items-center gap-2 cursor-pointer" id="desktop-profile-inner">'
          + '<img src="' + this.currentUser.avatar + '" alt="头像" class="avatar avatar-sm">'
          + '<span class="text-sm font-medium">' + this.currentUser.name + '</span></span>'
          + '<span class="text-xs text-morandi-light cursor-pointer hover:text-morandi-danger ml-2" id="desktop-logout-btn">退出</span>';
        var inner = document.getElementById('desktop-profile-inner');
        if (inner) inner.addEventListener('click', function() { pageManager.showStudent('profile-page'); });
        var logoutBtn = document.getElementById('desktop-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', function() { pageManager.logout(); });
      }
      if (guestBanner) guestBanner.style.display = 'none';
      if (tabProfile) { tabProfile.dataset.page = 'profile'; tabProfile.onclick = function() { pageManager.showStudent('profile-page'); }; }
    } else {
      if (authArea) {
        authArea.innerHTML = '<button class="btn-outline btn-sm" id="desktop-login-btn">登录</button>';
        var loginBtn = document.getElementById('desktop-login-btn');
        if (loginBtn) loginBtn.addEventListener('click', function() { pageManager.showStudent('login-page'); });
      }
      if (guestBanner) guestBanner.style.display = '';
      if (tabProfile) { tabProfile.dataset.page = 'login'; tabProfile.onclick = function() { pageManager.showStudent('login-page'); }; }
    }
  },

  updateTabBar: function(pageId) {
    document.querySelectorAll('.tab-item').forEach(function(item) {
      item.classList.remove('active');
      var dp = item.dataset.page;
      if ((dp === 'home' && pageId === 'home-page') ||
          (dp === 'housing-list' && (pageId === 'housing-list-page' || pageId === 'housing-detail-page' || pageId === 'housing-map-page')) ||
          (dp === 'commute-list' && (pageId === 'commute-list-page' || pageId === 'commute-detail-page' || pageId === 'commute-publish-page')) ||
          (dp === 'chat-messages' && pageId === 'chat-messages-page') ||
          (dp === 'profile' && pageId === 'profile-page') ||
          (dp === 'login' && pageId === 'login-page')) {
        item.classList.add('active');
      }
    });
  },

  updateLandlordSidebar: function(pageId) {
    var baseId = pageId.replace(/-page$/, '');
    document.querySelectorAll('[data-landlord-page]').forEach(function(l) {
      if (l.dataset.landlordPage === baseId) l.classList.add('active');
      else l.classList.remove('active');
    });
  },

  updateAdminSidebar: function(pageId) {
    var baseId = pageId.replace(/-page$/, '');
    document.querySelectorAll('[data-admin-page]').forEach(function(l) {
      if (l.dataset.adminPage === baseId) l.classList.add('active');
      else l.classList.remove('active');
    });
  }
};

// ============================================================================
document.addEventListener('DOMContentLoaded', function() {

  pageManager.updateAuthUI();

  // === 品牌 Logo 点击跳首页 ===
  var brand = document.getElementById('brand-logo');
  if (brand) brand.addEventListener('click', function() { pageManager.logout(); pageManager.showStudent('home-page'); });

  // === 游客横幅 ===
  function bindGuestBanner() {
    var gbS = document.getElementById('gb-student'), gbL = document.getElementById('gb-landlord'),
        gbA = document.getElementById('gb-admin'), gbC = document.getElementById('gb-close');
    if (gbS) gbS.addEventListener('click', function() { pageManager.login('student'); });
    if (gbL) gbL.addEventListener('click', function() { pageManager.login('landlord'); });
    if (gbA) gbA.addEventListener('click', function() { pageManager.login('admin'); });
    if (gbC) gbC.addEventListener('click', function() { document.getElementById('guest-banner').style.display = 'none'; });
  }
  bindGuestBanner();

  // === 登录页预设账号 ===
  ['student','landlord','admin'].forEach(function(r) {
    var el = document.getElementById('preset-' + r);
    if (el) el.addEventListener('click', function() { pageManager.login(r); });
  });

  // === 登录表单 ===
  var loginSubmitBtn = document.getElementById('login-submit-btn');
  if (loginSubmitBtn) loginSubmitBtn.addEventListener('click', function() { pageManager.show('verify-success-modal'); });

  var closeVerifyModal = document.getElementById('close-verify-modal');
  if (closeVerifyModal) closeVerifyModal.addEventListener('click', function() {
    document.getElementById('verify-success-modal').classList.add('hidden');
    pageManager.login('student');
  });

  var verifySubmitBtn = document.getElementById('verify-submit-btn');
  if (verifySubmitBtn) verifySubmitBtn.addEventListener('click', function() { pageManager.show('verify-success-modal'); });

  var verifyBackBtn = document.getElementById('verify-back-btn');
  if (verifyBackBtn) verifyBackBtn.addEventListener('click', function() { pageManager.showStudent('login-page'); });

  // === 手机端个人中心退出 ===
  var mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', function() { pageManager.logout(); });

  // === 桌面导航栏 ===
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var nav = link.dataset.nav;
      var navMap = { 'home': 'home-page', 'housing': 'housing-list-page', 'commute': 'commute-list-page', 'chat': 'chat-messages-page' };
      if (navMap[nav]) pageManager.showStudent(navMap[nav]);
      document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  // === 底部 Tab ===
  document.querySelectorAll('.tab-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var page = item.dataset.page;
      // 游客点击消息/我的 → 登录页
      if ((page === 'chat-messages' || page === 'profile' || page === 'login') && !pageManager.isLoggedIn()) {
        pageManager.showStudent('login-page');
        return;
      }
      var pageMap = {
        'home': 'home-page', 'housing-list': 'housing-list-page',
        'commute-list': 'commute-list-page', 'chat-messages': 'chat-messages-page',
        'profile': 'profile-page', 'login': 'login-page'
      };
      if (pageMap[page]) pageManager.showStudent(pageMap[page]);
    });
  });

  // === data-page 跳转 ===
  document.querySelectorAll('[data-page]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      var page = el.dataset.page;
      if ((page === 'chat-messages' || page === 'messages') && !pageManager.isLoggedIn()) {
        pageManager.showStudent('login-page'); return;
      }
      var pageMap = {
        'housing-list': 'housing-list-page', 'housing-detail': 'housing-detail-page',
        'housing-map': 'housing-map-page', 'roommate': 'roommate-page',
        'commute-list': 'commute-list-page', 'commute-detail': 'commute-detail-page',
        'commute-publish': 'commute-publish-page', 'messages': 'messages-page',
        'chat-messages': 'chat-messages-page', 'profile': 'profile-page', 'home': 'home-page'
      };
      if (pageMap[page]) pageManager.showStudent(pageMap[page]);
    });
  });

  // === 返回按钮 ===
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
  bindBack('chat-messages-back', 'home-page');

  // === 收藏按钮 ===
  var favBtn = document.getElementById('fav-house-btn');
  if (favBtn) favBtn.addEventListener('click', function() {
    var icon = this.querySelector('i');
    if (icon.classList.contains('fa-heart-o')) { icon.classList.remove('fa-heart-o'); icon.classList.add('fa-heart'); icon.style.color = '#C5837B'; }
    else { icon.classList.remove('fa-heart'); icon.classList.add('fa-heart-o'); icon.style.color = ''; }
  });

  // === 联系房东按钮 ===
  var contactBtn = document.getElementById('contact-landlord-btn');
  if (contactBtn) contactBtn.addEventListener('click', function() {
    if (!pageManager.isLoggedIn()) { pageManager.showStudent('login-page'); return; }
    alert('已向房东发送消息，可在消息中心查看');
  });

  // === 合租弹窗 ===
  var applyBtn = document.getElementById('apply-roommate-btn');
  if (applyBtn) applyBtn.addEventListener('click', function() { pageManager.show('roommate-modal'); });
  function bindModal(closeId, cancelId, modalId) {
    var c = document.getElementById(closeId), cc = document.getElementById(cancelId);
    if (c) c.addEventListener('click', function() { document.getElementById(modalId).classList.add('hidden'); });
    if (cc) cc.addEventListener('click', function() { document.getElementById(modalId).classList.add('hidden'); });
  }
  bindModal('close-roommate-modal', 'cancel-roommate-modal', 'roommate-modal');
  var cf = document.getElementById('confirm-roommate-modal');
  if (cf) cf.addEventListener('click', function() { document.getElementById('roommate-modal').classList.add('hidden'); alert('申请提交成功！'); });

  // === 发布合租弹窗 ===
  var pBtn = document.getElementById('publish-roommate-btn');
  if (pBtn) pBtn.addEventListener('click', function() { pageManager.show('publish-roommate-modal'); });
  bindModal('close-publish-roommate', 'cancel-publish-roommate', 'publish-roommate-modal');

  // === 登录页角色切换 ===
  var swLL = document.getElementById('switch-landlord-login');
  if (swLL) swLL.addEventListener('click', function(e) { e.preventDefault(); pageManager.showLandlord('landlord-login-page'); });
  var swAL = document.getElementById('switch-admin-login');
  if (swAL) swAL.addEventListener('click', function(e) { e.preventDefault(); pageManager.showAdmin('admin-login-page'); });
  var swSL = document.getElementById('switch-student-from-landlord');
  if (swSL) swSL.addEventListener('click', function(e) { e.preventDefault(); pageManager.showStudent('login-page'); });
  var swSA = document.getElementById('switch-student-from-admin');
  if (swSA) swSA.addEventListener('click', function(e) { e.preventDefault(); pageManager.showStudent('login-page'); });

  // === 房东/管理端登录 ===
  var llBtn = document.getElementById('landlord-login-submit-btn');
  if (llBtn) llBtn.addEventListener('click', function() { pageManager.login('landlord'); });
  var alBtn = document.getElementById('admin-login-submit-btn');
  if (alBtn) alBtn.addEventListener('click', function() { pageManager.login('admin'); });

  // === 侧边栏 ===
  document.querySelectorAll('[data-landlord-page]').forEach(function(l) {
    l.addEventListener('click', function(e) { e.preventDefault(); pageManager.showLandlord(l.dataset.landlordPage + '-page'); });
  });
  document.querySelectorAll('[data-admin-page]').forEach(function(l) {
    l.addEventListener('click', function(e) { e.preventDefault(); pageManager.showAdmin(l.dataset.adminPage + '-page'); });
  });

  // === 返回学生端 ===
  var swL = document.getElementById('sw-stu-from-ll-desk');
  if (swL) swL.addEventListener('click', function(e) { e.preventDefault(); pageManager.login('student'); });
  var swAd = document.getElementById('sw-stu-from-admin-desk');
  if (swAd) swAd.addEventListener('click', function(e) { e.preventDefault(); pageManager.login('student'); });

  // === 筛选标签 ===
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      var parent = this.parentElement;
      parent.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // === 模态背景关闭 ===
  document.querySelectorAll('.modal-overlay').forEach(function(o) {
    o.addEventListener('click', function(e) { if (e.target === this) this.classList.add('hidden'); });
  });

  // === 初始化 ===
  pageManager.showStudent('home-page');
});
