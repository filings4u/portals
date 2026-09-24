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
async function load(){const err=$('#pageError');if(err){err.hidden=true;err.textContent=''};$('#controlPlaneStatus').textContent='Checking control plane…';$('#controlPlaneDetail').textContent='Validating production services';
 const results=await Promise.allSettled([call('overview'),call('accounts'),call('people'),call('work_management_module',{module:'overview'})]);
 const overview=results[0].status==='fulfilled'?results[0].value:null,accountsData=results[1].status==='fulfilled'?results[1].value:null,people=results[2].status==='fulfilled'?results[2].value:null,work=results[3].status==='fulfilled'?results[3].value:null;
 const failures=results.filter(x=>x.status==='rejected');
 const orgs=new Set((accountsData?.accounts||[]).map(x=>x.organization_id).filter(Boolean));
 const counts=work?.data?.counts||{};
 $('#executiveMetrics').innerHTML=metric('Enterprise Accounts',overview?.total_accounts??'—','Across authorized business units')+metric('Organizations',orgs.size||'—','Unified business identities')+metric('People',people?.people?.length??'—','Unified person identities')+metric('Open Work Items',counts.open_tasks??'—','CRM and internal tasks');
 const wf=businessCount(overview,'workforce'),dot=businessCount(overview,'dot'),testing=businessCount(overview,'testing');
 $('#workforceCount').textContent=`${wf} Enterprise account${wf===1?'':'s'} →`;$('#dotCount').textContent=`${dot} Enterprise account${dot===1?'':'s'} →`;$('#testingCount').textContent=testing?`${testing} Enterprise account${testing===1?'':'s'} →`:'Open workspace →';
 const ready=[{ok:!!overview,title:'Enterprise identity & account directory',copy:overview?`${overview.total_accounts||0} accounts visible to your role.`:(results[0].reason?.message||'Unavailable')},{ok:!!accountsData,title:'Organizations & account directory',copy:accountsData?`${accountsData.accounts?.length||0} account records loaded.`:(results[1].reason?.message||'Unavailable')},{ok:!!people,title:'People & access projection',copy:people?`${people.people?.length||0} people visible to your role.`:(results[2].reason?.message||'Unavailable')},{ok:!!work,title:'Phase 15 work management',copy:work?`${counts.communication_threads||0} communication threads · ${counts.appointments||0} appointments.`:(results[3].reason?.message||'Unavailable')}];setReady(ready);
 if(failures.length){$('#controlPlaneStatus').textContent='Production attention required';$('#controlPlaneDetail').textContent=`${failures.length} control-plane check${failures.length===1?'':'s'} failed`;if(err){err.hidden=false;err.textContent=failures.map(x=>x.reason?.message||String(x.reason)).join(' · ')}}else{$('#controlPlaneStatus').textContent='Enterprise control plane online';$('#controlPlaneDetail').textContent='Phase 1–15 backend checks passed'}
}
async function init(){renderPhases();await load();$('#refreshEnterprise')?.addEventListener('click',load)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();