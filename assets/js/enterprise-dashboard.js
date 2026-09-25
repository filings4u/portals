(()=>{'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phases=[
 [1,'Enterprise Identity & Accounts','Organizations, accounts, C/TPA relationships, authoritative source links, and Customer 360.','admin-organizations.html'],
 [2,'People & Access','One person identity with separate staff, portal, employee/driver, and learner relationships.','admin-people.html'],
 [3,'Customer Operations','Customer-scoped operating console for cross-business management without duplicating source records.','admin-customer-operations.html'],
 [4,'Storefront & Catalogs','Central management of Testing, Training, Workforce, and DOT storefront/catalog systems.','admin-catalog-management.html'],
 [5,'Service Desk & Records','Documents, communications, support, and audit records across the ecosystem.','admin-service-desk.html'],
 [6,'Security & Access','Production administrator authorization, staff roles, product access, assignments, and session hardening.','admin-security-access.html'],
 [7,'Route Consolidation','Legacy admin URLs route into canonical Enterprise management surfaces while specialized workflows remain intact.','admin-legacy-routes.html'],
 [8,'Customer Setup','Canonical DOT and NON-DOT customer creation, onboarding, and setup.','admin-customer-setup.html'],
 [9,'Customer Configuration','Customer-specific locations, integrations, consents, credentials, policies, and scoped configuration.','admin-customer-setup.html?tab=manage'],
 [10,'Operations Command Center','DOT and NON-DOT program, random-testing, pools, selections, and operational management.','admin-operations-command-center.html'],
 [11,'Compliance Command Center','Compliance cases, tasks, return-to-duty, post-accident, Clearinghouse, and regulatory lifecycle.','admin-compliance-command-center.html'],
 [12,'Agency & Workforce Management','DOT agency workspaces plus DOT/NON-DOT workforce roster and driver/employee management.','admin-agency-workforce-management.html'],
 [13,'Revenue & Service Management','Subscriptions, billing, pricing, service eligibility, service orders, and revenue operations.','admin-revenue-service-management.html'],
 [14,'Testing Command Center','screenings4u Testing administration consolidated into one canonical testing workspace.','admin-testing-command-center.html'],
 [15,'Work Management','CRM, tasks, communications, scheduling, availability, staff, resources, waitlist, and scheduling configuration.','admin-work-management.html']
];
async function call(action,body={}){const sb=window.screenings4uSupabase;if(!sb?.functions)throw new Error('Supabase client unavailable.');const {data,error}=await sb.functions.invoke('enterprise-control-plane',{body:{action,...body}});if(error)throw error;if(data?.error)throw new Error(data.error);return data}
function renderPhases(){const host=$('#phaseGrid');host.innerHTML=phases.map(([n,title,copy,href])=>`<a class="ep2-phase" href="${href}"><span class="ep2-phase-num">${n}</span><div><small>PHASE ${n}</small><strong>${esc(title)}</strong><p>${esc(copy)}</p></div><b>→</b></a>`).join('')}
function metric(label,value,copy){return `<article><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(copy)}</small></article>`}
function businessCount(overview,code){return Number(overview?.counts?.[code]?.accounts||0)}
function setReady(items){$('#readinessList').innerHTML=items.map(x=>`<div><i class="${x.ok?'ok':'bad'}"></i><span><strong>${esc(x.title)}</strong><small>${esc(x.copy)}</small></span></div>`).join('')}
async function load(){const err=$('#pageError');if(err){err.hidden=true;err.textContent=''};$('#controlPlaneStatus').textContent='Checking control plane…';$('#controlPlaneDetail').textContent='Loading executive summary';
 try{
  const summary=await call('dashboard_summary');
  $('#executiveMetrics').innerHTML=metric('Enterprise Accounts',summary.total_accounts??0,'Active customer/business relationships')+metric('Organizations',summary.organization_count??0,'Unified business identities')+metric('People',summary.people_count??0,'Unified person identities')+metric('Open Work Items',summary.open_tasks??0,'CRM and internal tasks');
  const wf=businessCount(summary,'workforce'),dot=businessCount(summary,'dot'),testing=businessCount(summary,'testing');
  $('#workforceCount').textContent=`${wf} Enterprise account${wf===1?'':'s'} →`;$('#dotCount').textContent=`${dot} Enterprise account${dot===1?'':'s'} →`;$('#testingCount').textContent=testing?`${testing} Enterprise account${testing===1?'':'s'} →`:'Open workspace →';
  setReady([
   {ok:true,title:'Enterprise identity & account directory',copy:`${summary.total_accounts||0} active accounts visible to your role.`},
   {ok:true,title:'Organizations',copy:`${summary.organization_count||0} organizations in the authorized business scope.`},
   {ok:true,title:'People & access projection',copy:`${summary.people_count||0} people in the unified identity layer.`},
   {ok:true,title:'Work management',copy:`${summary.open_tasks||0} open work items.`}
  ]);
  $('#controlPlaneStatus').textContent='Enterprise control plane online';$('#controlPlaneDetail').textContent='Executive summary loaded';
 }catch(e){
  $('#controlPlaneStatus').textContent='Production attention required';$('#controlPlaneDetail').textContent='Executive summary failed';setReady([{ok:false,title:'Enterprise summary',copy:e?.message||String(e)}]);if(err){err.hidden=false;err.textContent=e?.message||String(e)}
 }
}
async function init(){renderPhases();await load();$('#refreshEnterprise')?.addEventListener('click',load)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();