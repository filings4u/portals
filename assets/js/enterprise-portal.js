(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const page=(location.pathname.split('/').pop()||'admin-dashboard.html').toLowerCase();
const state={ctx:null};
const ICONS={
 home:'<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>',
 testing:'<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v5l-4.5 8.4A3 3 0 0 0 8.1 21h7.8a3 3 0 0 0 2.6-4.6L14 8V3"/><path d="M7.5 15h9"/></svg>',
 training:'<svg viewBox="0 0 24 24"><path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M7 10.2V15c0 1.8 2.2 3 5 3s5-1.2 5-3v-4.8"/><path d="M21 8v6"/></svg>',
 workforce:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.4-4 2.5-6 5.5-6s5.1 2 5.5 6"/><path d="M13 16c1-.9 2.2-1.4 3.8-1.4 2.5 0 4 1.6 4.7 4.4"/></svg>',
 dot:'<svg viewBox="0 0 24 24"><path d="M4 6h11v10H4z"/><path d="M15 9h3l2 3v4h-5z"/><circle cx="8" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>',
 assignments:'<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 3v4M16 3v4M4 9h16"/><path d="M8 13h3M8 16h6"/></svg>',
 finance:'<svg viewBox="0 0 24 24"><path d="M4 7h16v12H4z"/><path d="M4 10h16"/><path d="M8 15h3"/><path d="M7 4h10"/></svg>',
 crm:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>',
 schedule:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg>',
 docs:'<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
 staff:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><path d="M3 20c.5-4 2.4-6 5-6s4.5 2 5 6"/><path d="M16 7h5M18.5 4.5v5M16 14h5M16 18h5"/></svg>',
 audit:'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.8-2.7 8.1-7 10-4.3-1.9-7-5.2-7-10V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.5 7.5 0 0 0-1.8-1L14.4 3h-4.8l-.4 3.1a7.5 7.5 0 0 0-1.8 1l-2.4-1-2 3.4L5 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.5 7.5 0 0 0 1.8 1l.4 3.1h4.8l.4-3.1a7.5 7.5 0 0 0 1.8-1l2.4 1 2-3.4L19 13a7 7 0 0 0 0-1Z"/></svg>',
 tech:'<svg viewBox="0 0 24 24"><path d="M8 12h8M12 8v8"/><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
 help:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 4.4 1.7c-.9.9-2.1 1.2-2.1 2.8M12 17h.01"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8"/><path d="M10 21h4"/></svg>',
 user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-5 3.2-7.5 8-7.5s7.3 2.5 8 7.5"/></svg>',
 menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 chevron:'<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>'
};
const modules={
 testing:{label:'Testing',landing:'admin-testing-orders.html',product:'screenings4u',groups:[
  ['Testing Operations',[
   ['admin-testing-orders.html','Testing Orders'],['admin-testing-cases.html','Testing Cases'],['admin-testing-schedule.html','Scheduling'],['admin-testing-results.html','Results'],['admin-testing-providers.html','Providers'],['admin-testing-customers.html','Customers']]],
  ['Service Management',[
   ['admin-testing-services.html','Service Catalog'],['admin-testing-background.html','Background Checks'],['admin-testing-mobile.html','Mobile & Onsite Testing'],['admin-testing-post-accident.html','Post-Accident Testing'],['admin-testing-court-orders.html','Court-Ordered Testing'],['admin-testing-documents.html','Documents'],['admin-testing-reports.html','Reports']]]]},
 training:{label:'Training',landing:'admin-lms-courses.html',product:'training',groups:[
  ['Learner Management',[
   ['admin-lms-students.html','Students'],['admin-lms-enrollments.html','Enrollments'],['admin-lms-sponsorships.html','Employer Sponsorships'],['admin-lms-progress.html','Learner Progress'],['admin-lms-certificates.html','Certificates'],['admin-lms-documents.html','Documents']]],
  ['Course Management',[
   ['admin-lms-courses.html','Courses'],['admin-lms-creation.html','Create Course'],['admin-lms-lessons.html','Lessons'],['admin-lms-assessments.html','Assessments'],['admin-lms-quizzes.html','Quizzes'],['admin-lms-video.html','Media'],['admin-lms-course-engagement.html','Course Engagement']]]]},
 workforce:{label:'Workforce',landing:'admin-workforce-ctpas.html',product:'workforce',groups:[
  ['Customers & Access',[
   ['admin-workforce-ctpas.html','C/TPA Accounts'],['admin-workforce-employers.html','Non-DOT Employers'],['admin-workforce-employees.html','Employees / NON-DOT Drivers'],['admin-workforce-onboarding.html','Onboarding'],['admin-workforce-portal-access.html','NON-DOT Portal Access'],['admin-workforce-users.html','Users & Team'],['admin-customer-assignments.html','Staff Assignments']]],
  ['Programs & Testing',[
   ['admin-workforce-programs.html','Non-DOT Programs'],['admin-workforce-pools.html','Consortiums & Random Pools'],['admin-workforce-pool-members.html','Pool Memberships'],['admin-workforce-selections.html','Random Selections'],['admin-workforce-testing.html','Testing Orders'],['admin-workforce-results.html','Results']]],
  ['Customer Configuration',[
   ['admin-workforce-plans.html','Plans & Features'],['admin-workforce-billing.html','Billing & Subscriptions'],['admin-workforce-locations.html','Locations'],['admin-workforce-branding.html','Branding'],['admin-workforce-integrations.html','Integrations'],['admin-workforce-consents.html','Consents & Acknowledgments'],['admin-workforce-credentials.html','Credentials']]],
  ['Operations & Compliance',[
   ['admin-workforce-services.html','Service Configuration'],['admin-workforce-compliance.html','Compliance Cases'],['admin-workforce-policies.html','Policies'],['admin-workforce-documents.html','Documents'],['admin-workforce-training.html','Training Records'],['admin-workforce-notifications.html','Notifications'],['admin-workforce-support.html','Support'],['admin-workforce-audit.html','Audit History'],['admin-workforce-reports.html','Reports']]]]},
 dot:{label:'DOT',landing:'admin-dot-ctpas.html',product:'dot',groups:[
  ['Customers & Access',[
   ['admin-dot-ctpas.html','DOT C/TPAs'],['admin-dot-employers.html','DOT Employers'],['admin-dot-owner-operators.html','Owner-Operators'],['admin-dot-drivers.html','Drivers'],['admin-dot-portal-access.html','Portal Access'],['admin-customer-assignments.html','Staff Assignments']]],
  ['Programs & Randoms',[
   ['admin-dot-programs.html','DOT Programs'],['admin-dot-consortiums.html','Consortiums'],['admin-dot-pools.html','Random Pools'],['admin-dot-pool-members.html','Pool Memberships'],['admin-dot-selections.html','Random Selections'],['admin-dot-testing.html','Testing Orders'],['admin-dot-results.html','Results'],['admin-dot-post-accident.html','Post-Accident']]],
  ['Customer Configuration',[
   ['admin-dot-plans.html','Plans & Features'],['admin-dot-billing.html','Billing & Subscriptions'],['admin-dot-users.html','Users & Roles'],['admin-dot-locations.html','Locations'],['admin-dot-branding.html','Branding'],['admin-dot-integrations.html','Integrations'],['admin-dot-consents.html','Consents & Acknowledgments'],['admin-dot-credentials.html','Credentials'],['admin-dot-training.html','Training Records']]],
  ['Agency Management',[
   ['admin-dot-fmcsa.html','FMCSA'],['admin-dot-faa.html','FAA'],['admin-dot-fra.html','FRA'],['admin-dot-fta.html','FTA'],['admin-dot-phmsa.html','PHMSA'],['admin-dot-uscg.html','USCG']]],
  ['Regulatory Operations',[
   ['admin-dot-clearinghouse.html','Clearinghouse'],['admin-dot-new-entrant.html','New Entrant Audits'],['admin-dot-rtd.html','Return-to-Duty / SAP'],['admin-dot-compliance.html','Compliance Cases'],['admin-dot-services.html','DOT Service Catalog'],['admin-dot-orders.html','Service Orders'],['admin-dot-documents.html','Documents'],['admin-dot-notifications.html','Notifications'],['admin-dot-support.html','Support'],['admin-dot-audit.html','Audit History'],['admin-dot-reports.html','Reports']]]]},
 finance:{label:'Finance',landing:'admin-finance-ar.html',product:'finance',permission:c=>!c||c.super_admin||(c.permissions||[]).some(x=>String(x).startsWith('finance.')),groups:[
  ['Finance Operations',[
   ['admin-finance-ar.html','Accounts Receivable'],['admin-finance-ap.html','Accounts Payable'],['admin-finance-invoices.html','Invoicing'],['admin-finance-accounting.html','Accounting'],['admin-finance-statements.html','Financial Statements'],['admin-finance-orders.html','All Orders']]],
  ['Billing Tools',[
   ['admin-checkout.html','Checkout'],['admin-discounts.html','Discounts']]]]} 
};
const explicit={
 'admin-testing.html':'testing','admin-testing-orders.html':'testing','admin-testing-cases.html':'testing','admin-testing-case.html':'testing','admin-testing-schedule.html':'testing','admin-testing-results.html':'testing','admin-testing-providers.html':'testing','admin-testing-customers.html':'testing','admin-testing-services.html':'testing','admin-testing-background.html':'testing','admin-testing-mobile.html':'testing','admin-testing-post-accident.html':'testing','admin-testing-court-orders.html':'testing','admin-testing-documents.html':'testing','admin-testing-reports.html':'testing','admin-orders.html':'testing','admin-test-results.html':'testing','admin-scheduling.html':'testing',
 'admin-workforce.html':'workforce','admin-workforce-ctpas.html':'workforce','admin-workforce-employers.html':'workforce','admin-workforce-employer.html':'workforce','admin-workforce-employees.html':'workforce','admin-workforce-employee.html':'workforce','admin-workforce-onboarding.html':'workforce','admin-workforce-portal-access.html':'workforce','admin-workforce-programs.html':'workforce','admin-workforce-pools.html':'workforce','admin-workforce-pool-members.html':'workforce','admin-workforce-selections.html':'workforce','admin-workforce-services.html':'workforce','admin-workforce-compliance.html':'workforce','admin-workforce-policies.html':'workforce','admin-workforce-documents.html':'workforce','admin-workforce-training.html':'workforce','admin-workforce-notifications.html':'workforce','admin-workforce-testing.html':'workforce','admin-workforce-results.html':'workforce','admin-workforce-plans.html':'workforce','admin-workforce-billing.html':'workforce','admin-workforce-users.html':'workforce','admin-workforce-locations.html':'workforce','admin-workforce-branding.html':'workforce','admin-workforce-integrations.html':'workforce','admin-workforce-consents.html':'workforce','admin-workforce-credentials.html':'workforce','admin-workforce-audit.html':'workforce','admin-workforce-support.html':'workforce','admin-workforce-reports.html':'workforce','admin-customer-assignments.html':'workforce',
 'admin-dot.html':'dot','admin-dot-testing.html':'dot','admin-dot-results.html':'dot','admin-dot-post-accident.html':'dot','admin-dot-plans.html':'dot','admin-dot-billing.html':'dot','admin-dot-users.html':'dot','admin-dot-locations.html':'dot','admin-dot-branding.html':'dot','admin-dot-integrations.html':'dot','admin-dot-consents.html':'dot','admin-dot-credentials.html':'dot','admin-dot-training.html':'dot','admin-dot-support.html':'dot','admin-dot-audit.html':'dot','admin-dot-orders.html':'dot','admin-dot-fmcsa.html':'dot','admin-dot-faa.html':'dot','admin-dot-fra.html':'dot','admin-dot-fta.html':'dot','admin-dot-phmsa.html':'dot','admin-dot-uscg.html':'dot','admin-dot-ctpas.html':'dot','admin-dot-employers.html':'dot','admin-dot-owner-operators.html':'dot','admin-dot-drivers.html':'dot','admin-dot-portal-access.html':'dot','admin-dot-programs.html':'dot','admin-dot-consortiums.html':'dot','admin-dot-pools.html':'dot','admin-dot-pool-members.html':'dot','admin-dot-selections.html':'dot','admin-dot-clearinghouse.html':'dot','admin-dot-new-entrant.html':'dot','admin-dot-rtd.html':'dot','admin-dot-compliance.html':'dot','admin-dot-services.html':'dot','admin-dot-documents.html':'dot','admin-dot-notifications.html':'dot','admin-dot-reports.html':'dot',
 'admin-finance-ar.html':'finance','admin-finance-ap.html':'finance','admin-finance-invoices.html':'finance','admin-finance-accounting.html':'finance','admin-finance-statements.html':'finance','admin-finance-orders.html':'finance','admin-invoices.html':'finance','admin-invoice.html':'finance','admin-checkout.html':'finance','admin-discounts.html':'finance'
};
const navAliases={
 'admin-testing.html':'admin-testing-orders.html',
 'admin-testing-case.html':'admin-testing-cases.html',
 'admin-orders.html':'admin-testing-orders.html',
 'admin-test-results.html':'admin-testing-results.html',
 'admin-scheduling.html':'admin-testing-schedule.html',
 'admin-lms-dashboard.html':'admin-lms-courses.html',
 'admin-lms-course-manager.html':'admin-lms-courses.html',
 'admin-lms-course-builder.html':'admin-lms-courses.html',
 'admin-lms-lesson-builder.html':'admin-lms-lessons.html',
 'admin-workforce.html':'admin-workforce-ctpas.html',
 'admin-workforce-employer.html':'admin-workforce-employers.html',
 'admin-workforce-employee.html':'admin-workforce-employees.html',
 'admin-dot.html':'admin-dot-ctpas.html',
 'admin-invoice.html':'admin-finance-invoices.html',
 'admin-invoices.html':'admin-finance-invoices.html'
};
function activeNavPage(){return navAliases[page]||page}
function moduleForPage(){if(explicit[page])return explicit[page];if(page.startsWith('admin-lms-'))return'training';if(page.startsWith('admin-workforce-'))return'workforce';if(page.startsWith('admin-dot-'))return'dot';if(page.startsWith('admin-testing-')||page.startsWith('admin-scheduling-'))return'testing';if(page.startsWith('admin-finance-'))return'finance';return'testing'}
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function initials(v='Administrator'){return String(v).split(/[\s._@-]+/).filter(Boolean).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'A'}
function visibleModules(){const c=state.ctx,prods=new Set((c?.product_access||[]).map(x=>x.product_code));return Object.entries(modules).filter(([_,m])=>{if(c?.super_admin)return true;if(m.product&&c&&prods.size&&!prods.has(m.product))return false;return !m.permission||m.permission(c)})}
const adminItems=[
 ['admin-staff.html','Staff & Departments','staff'],
 ['admin-customer-assignments.html','Customer Assignments','assignments'],
 ['admin-audit.html','Audit & Security','audit'],
 ['admin-global-settings.html','System Settings','settings'],
 ['admin-technology.html','Integrations','tech'],
 ['admin-support-tickets.html','Help & Support','help']
];
const moduleIcons={testing:'testing',training:'training',workforce:'workforce',dot:'dot',finance:'finance'};
function navItem([href,label,icon],activeModule){const active=activeNavPage()===href;const ic=icon||moduleIcons[activeModule]||'home';return `<a class="ep-side-link ${active?'active':''}" href="${href}"${active?' aria-current="page"':''}><span class="ep-side-icon">${ICONS[ic]||ICONS.home}</span><span>${escapeHtml(label)}</span></a>`}
function sidebar(){const key=moduleForPage(),m=modules[key]||modules.testing;return `<aside class="ep-sidebar"><div class="ep-brand"><a href="admin-dashboard.html"><img src="images/logo2.png" alt="screenings4u"><span>screenings4u Enterprise</span></a></div><nav class="ep-side-scroll" aria-label="${escapeHtml(m.label)} management"><div class="ep-side-section ep-side-home">${navItem(['admin-dashboard.html','Executive Overview','home'],key)}</div><div class="ep-side-divider"></div>${m.groups.map(([title,links])=>`<div class="ep-side-label">${escapeHtml(title)}</div><div class="ep-side-section">${links.map(x=>navItem(x,key)).join('')}</div>`).join('')}<div class="ep-side-divider"></div><div class="ep-side-label">Administration</div><div class="ep-side-section">${adminItems.map(x=>navItem(x,key)).join('')}</div></nav><div class="ep-side-promo" aria-label="Safer People. Stronger Workplaces. Compliance today. Opportunities tomorrow."><div class="ep-side-promo-image"></div><div class="ep-side-promo-copy"><strong>Safer People.<br>Stronger Workplaces</strong><span>Compliance today.<br>Opportunities tomorrow.</span><i></i></div></div></aside>`}
function tabDropdown(key,m){const active=page!=='admin-dashboard.html'&&moduleForPage()===key;return `<div class="ep-biz-tab-wrap"><a class="ep-biz-tab ${active?'active':''}" href="${m.landing}"${active?' aria-current="page"':''}>${escapeHtml(m.label)}</a></div>`}
function topbar(){const c=state.ctx,email=c?.user?.email||'Administrator',display=c?.profile?.display_name||c?.user?.user_metadata?.full_name||email.split('@')[0]||'Administrator',role=c?.roles?.[0]?.name||'Internal Staff';return `<div class="ep-top-brand"><button class="ep-mobile-menu" id="epMobileMenu" aria-label="Open navigation">${ICONS.menu}</button><div><strong>screenings4u Enterprise</strong><small>Business operations. One enterprise system.</small></div></div><nav class="ep-business-tabs" aria-label="Business platforms">${visibleModules().map(([k,m])=>tabDropdown(k,m)).join('')}</nav><div class="ep-top-actions"><button class="ep-top-icon" id="epSearchBtn" aria-label="Search" title="Search">${ICONS.search}</button><a class="ep-top-icon ep-notification-button" href="admin-notifications.html" aria-label="Notifications" title="Notifications">${ICONS.bell}<span class="ep-notify-dot" aria-hidden="true"></span></a><button class="ep-top-icon" id="epHelpBtn" aria-label="Help" title="Help">${ICONS.help}</button><div class="ep-user-menu"><button class="ep-user-toggle" id="epUserToggle"><span class="ep-avatar">${initials(display)}</span><span class="ep-user-copy"><strong>${escapeHtml(display)}</strong><small>${escapeHtml(role)}</small></span><span class="ep-user-caret">⌄</span></button><div class="ep-menu" id="epUserMenu"><div class="ep-menu-head"><div><strong>${escapeHtml(display)}</strong><small>${escapeHtml(email)}</small></div><button class="ep-menu-close" aria-label="Close">${ICONS.x}</button></div><a href="admin-accounts.html">Account & access</a><a href="admin-notifications.html">Notifications</a><a href="admin-support-tickets.html">Support center</a><button data-ep-logout>Sign out</button></div></div></div>`}
function searchIndex(){const x=[];for(const [k,m] of Object.entries(modules))for(const [group,links] of m.groups)for(const [href,label] of links)x.push({href,label,group,module:m.label});for(const [href,label] of adminItems)if(!x.some(i=>i.href===href))x.push({href,label,group:'Administration',module:'Enterprise'});return x}
function overlays(){if(!$('.ep-overlay'))document.body.insertAdjacentHTML('beforeend','<div class="ep-overlay" id="epOverlay"></div>');if(!$('#epSearchModal'))document.body.insertAdjacentHTML('beforeend',`<div class="ep-search-modal" id="epSearchModal" aria-hidden="true"><div class="ep-search-dialog" role="dialog" aria-modal="true" aria-label="Search internal operations"><div class="ep-search-head"><span>${ICONS.search}</span><input id="epCommandSearch" type="search" placeholder="Search people, customers, invoices, or pages" autocomplete="off"><kbd>Ctrl K</kbd><button class="ep-search-close" aria-label="Close">${ICONS.x}</button></div><div class="ep-search-results" id="epCommandResults"><div class="ep-search-empty">Start typing to search the internal platform.</div></div></div></div>`);if(!$('#epHelpPanel'))document.body.insertAdjacentHTML('beforeend',`<div class="ep-help-panel" id="epHelpPanel"><div class="ep-help-head"><div><span>Support</span><strong>Need help?</strong></div><button class="ep-help-close" aria-label="Close">${ICONS.x}</button></div><p>Open the internal support queue, knowledge base, or audit trail without leaving your current business area.</p><a href="admin-support-tickets.html">Support queue</a><a href="admin-knowledge-base.html">Knowledge base</a><a href="admin-audit.html">Audit & security</a></div>`)}
function render(){document.body.classList.add('ep-enterprise-shell');const side=$('#admin-lms-sidebar-target');if(side)side.innerHTML=sidebar();let top=$('.admin-lms-topbar');if(!top){top=document.createElement('header');top.className='admin-lms-topbar';$('.admin-lms-main')?.prepend(top)}if(top)top.innerHTML=topbar();overlays();wire();}
function closeFloating(){$('#epUserMenu')?.classList.remove('open');$('#epHelpPanel')?.classList.remove('open');$('#epSearchModal')?.classList.remove('open');$('#epSearchModal')?.setAttribute('aria-hidden','true');document.body.classList.remove('ep-search-open');}
function openSearch(){const m=$('#epSearchModal');m?.classList.add('open');m?.setAttribute('aria-hidden','false');document.body.classList.add('ep-search-open');setTimeout(()=>$('#epCommandSearch')?.focus(),30)}
function keepActiveNavigationVisible(){const scroller=$('.ep-side-scroll'),active=$('.ep-side-link.active');if(!scroller||!active)return;requestAnimationFrame(()=>{const sr=scroller.getBoundingClientRect(),ar=active.getBoundingClientRect();const target=scroller.scrollTop+(ar.top-sr.top)-(scroller.clientHeight-ar.height)/2;scroller.scrollTo({top:Math.max(0,target),behavior:'auto'})})}
function wire(){keepActiveNavigationVisible();const overlay=$('#epOverlay');$('#epMobileMenu')?.addEventListener('click',()=>document.body.classList.add('ep-mobile-open'));overlay?.addEventListener('click',()=>{document.body.classList.remove('ep-mobile-open');closeFloating()});$$('.ep-side-link').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('ep-mobile-open')));
 const menu=$('#epUserMenu');$('#epUserToggle')?.addEventListener('click',e=>{e.stopPropagation();$('#epHelpPanel')?.classList.remove('open');menu?.classList.toggle('open')});$('.ep-menu-close')?.addEventListener('click',()=>menu?.classList.remove('open'));document.addEventListener('click',e=>{if(!e.target.closest('.ep-user-menu'))menu?.classList.remove('open')});
 $('#epHelpBtn')?.addEventListener('click',e=>{e.stopPropagation();menu?.classList.remove('open');$('#epHelpPanel')?.classList.toggle('open')});$('.ep-help-close')?.addEventListener('click',()=>$('#epHelpPanel')?.classList.remove('open'));document.addEventListener('click',e=>{if(!e.target.closest('#epHelpPanel')&&!e.target.closest('#epHelpBtn'))$('#epHelpPanel')?.classList.remove('open')});
 $('#epSearchBtn')?.addEventListener('click',openSearch);$('.ep-search-close')?.addEventListener('click',closeFloating);$('#epSearchModal')?.addEventListener('click',e=>{if(e.target.id==='epSearchModal')closeFloating()});
 const input=$('#epCommandSearch'),results=$('#epCommandResults'),idx=searchIndex();if(input&&results){const run=()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='<div class="ep-search-empty">Start typing to search the internal platform.</div>';return}const hits=idx.filter(x=>`${x.label} ${x.group} ${x.module} ${x.href}`.toLowerCase().includes(q)).slice(0,14);results.innerHTML=hits.map(x=>`<a href="${x.href}"><div><strong>${escapeHtml(x.label)}</strong><small>${escapeHtml(x.module)} · ${escapeHtml(x.group)}</small></div>${ICONS.chevron}</a>`).join('')||'<div class="ep-search-empty">No matching pages found.</div>'};input.addEventListener('input',run)}
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape'){document.body.classList.remove('ep-mobile-open');closeFloating()}});
 $('[data-ep-logout]')?.addEventListener('click',async()=>{try{await window.screenings4uSupabase?.auth?.signOut({scope:'local'})}finally{location.href='admin-login.html'}});
 // Add a visible close control to legacy floating surfaces without changing their business logic.
 $$('[role="dialog"],.modal,.dropdown-menu,.popover,.drawer').forEach(el=>{if(el.closest('#epSearchModal')||el.querySelector('[data-close],.modal-close,.ep-auto-close'))return;const b=document.createElement('button');b.type='button';b.className='ep-auto-close';b.innerHTML=ICONS.x;b.setAttribute('aria-label','Close');if(getComputedStyle(el).position==='static')el.style.position='relative';b.onclick=()=>{el.classList.remove('open','active','show');el.hidden=true};el.prepend(b)});
}
async function waitForVerifiedAdmin(){
 try{
  const ready=window.S4UPortalGuard?.waitForAdmin;
  if(typeof ready==='function')return await ready();
  if(window.S4UAdminReady)return await window.S4UAdminReady;
  if(window.S4UAuth?.requireAuth)return await window.S4UAuth.requireAuth({portal:'admin',loginPage:'admin-login.html'});
 }catch(err){console.error('[Enterprise Shell] admin authentication failed',err)}
 return null;
}
async function loadContext(){
 try{
  const authState=await waitForVerifiedAdmin();
  if(!authState?.user?.id)return;
  const sb=window.screenings4uSupabase;
  if(!sb?.functions)return;
  const {data,error}=await sb.functions.invoke('screenings4u-staff-context',{body:{action:'context'}});
  if(error)throw error;
  if(data?.user)state.ctx={...data,super_admin:data.is_super_admin,product_access:data.products||data.product_access||[]};
 }catch(err){console.warn('[Enterprise Shell] staff context unavailable',err)}
}
async function init(){await loadContext();render();document.documentElement.classList.add('ep-ready')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();
