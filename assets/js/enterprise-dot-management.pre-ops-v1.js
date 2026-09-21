(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const END='https://wyezpseboxbmkedvbmyx.supabase.co/functions/v1/dot-enterprise-management',KEY='sb_publishable__BLewZS6h2V4yUczky-BTQ_EemiOdDL';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const cfg={
'admin-dot-ctpas.html':['ctpas','DOT C/TPAs',['C/TPA','Email','Phone','Status']],
'admin-dot-employers.html':['employers','DOT Employers',['Employer','DOT #','Agency','Status']],
'admin-dot-owner-operators.html':['owner_operators','Owner-Operators',['Owner-Operator','DOT #','State','Status']],
'admin-dot-drivers.html':['drivers','Drivers',['Driver','Employer','Agency','Status']],
'admin-dot-portal-access.html':['portal_access','Portal Access',['User / Account','Role / Surface','Status','Portal']],
'admin-dot-programs.html':['programs','DOT Programs',['Program','Employer','Agency','Status']],
'admin-dot-consortiums.html':['pools','Consortiums',['Pool','Type','Agency','Status']],
'admin-dot-pools.html':['pools','Random Pools',['Pool','Type','Agency','Status']],
'admin-dot-pool-members.html':['pool_members','Pool Memberships',['Employee','Pool','Effective','Eligibility']],
'admin-dot-selections.html':['selections','Random Selections',['Pool','Date','Population','Status']],
'admin-dot-clearinghouse.html':['clearinghouse','Clearinghouse',['Account','Registered Email','Queries','Status']],
'admin-dot-new-entrant.html':['new_entrant','New Entrant Audits',['Employer','Agency','Account','Status']],
'admin-dot-rtd.html':['rtd','Return-to-Duty / SAP',['Case','Evaluation','RTD Status','Status']],
'admin-dot-compliance.html':['compliance','Compliance Cases',['Case','Employer','Priority','Status']],
'admin-dot-services.html':['services','DOT Service Catalog',['Service','Category','Delivery','Status']],
'admin-dot-documents.html':['documents','Documents',['File','Employer','Type','Uploaded']],
'admin-dot-notifications.html':['notifications','Notifications',['Subject','Channel','Status','Queued']],
'admin-dot-reports.html':['reports','Reports',['Metric','Value','','']]
};
async function client(){for(let i=0;i<40;i++){const c=window.screenings4uSupabase||window.supabaseClient;if(c?.auth?.getSession)return c;await new Promise(r=>setTimeout(r,50))}throw new Error('Supabase client unavailable.');}
async function call(action){const c=await client(),{data:{session}}=await c.auth.getSession();if(!session)throw new Error('Your staff session has expired.');const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':KEY},body:JSON.stringify({action})});const d=await r.json().catch(()=>({}));if(!r.ok||d.error)throw new Error(d.error||`Request failed (${r.status}).`);return d;}
const fmt=d=>d?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(d)):'—';
const badge=v=>`<span class="ep-business-pill">${esc(String(v||'—').replaceAll('_',' '))}</span>`;
function rows(action,d){let r=[];
if(action==='ctpas')r=(d.ctpas||[]).map(x=>[x.organization_id,x.support_email||'—',x.support_phone||'—',badge(x.status)]);
if(action==='employers')r=(d.employers||[]).map(x=>[x.legal_name,x.dot_number||'—',x.applicable_dot_agency||'—',badge(x.status)]);
if(action==='owner_operators')r=(d.owner_operators||[]).map(x=>[x.legal_name,x.dot_number||'—',x.state||'—',badge(x.status)]);
if(action==='drivers')r=(d.drivers||[]).map(x=>[[x.first_name,x.last_name].filter(Boolean).join(' '),x.employer_id,x.dot_agency||'—',badge(x.employment_status)]);
if(action==='portal_access'){r=(d.memberships||[]).slice(0,250).map(x=>[x.user_id,x.role_id,badge(x.status),x.organization_id]);for(const x of d.ctpa_portal_access||[])r.push([x.ctpa_id,'C/TPA Surface',badge(x.enabled?'enabled':'disabled'),x.portal_code])}
if(action==='programs')r=(d.programs||[]).map(x=>[x.name,x.employer_id,x.dot_agency||'—',badge(x.status)]);
if(action==='pools')r=(d.pools||[]).map(x=>[x.name,x.pool_type,x.dot_agency||'—',badge(x.status)]);
if(action==='pool_members')r=(d.pool_members||[]).map(x=>[x.employee_id,x.pool_id,fmt(x.effective_date),badge(x.eligibility_status)]);
if(action==='selections')r=(d.selections||[]).map(x=>[x.pool_id,fmt(x.selection_date),x.population_size,badge(x.status)]);
if(action==='clearinghouse')r=(d.clearinghouse||[]).map(x=>[x.clearinghouse_account_name||x.ctpa_id,x.registered_email||'—',x.query_management_enabled?'Enabled':'Disabled',badge(x.setup_status)]);
if(action==='new_entrant')r=(d.regulatory||[]).map(x=>[x.employer_id,x.agency_code,x.account_identifier||'—',badge(x.status)]);
if(action==='rtd')r=(d.rtd_cases||[]).map(x=>[x.compliance_case_id,fmt(x.evaluation_date),x.return_to_duty_status||'—',badge(x.status)]);
if(action==='compliance')r=(d.compliance_cases||[]).map(x=>[x.case_number,x.employer_id,x.priority,badge(x.status)]);
if(action==='services')r=(d.services||[]).map(x=>[x.name,x.category,x.delivery_mode,badge(x.operational_status)]);
if(action==='documents')r=(d.documents||[]).slice(0,500).map(x=>[x.file_name,x.employer_id||'—',x.document_type,fmt(x.uploaded_at)]);
if(action==='notifications')r=(d.notifications||[]).slice(0,500).map(x=>[x.subject||x.event_type,x.channel,badge(x.status),fmt(x.queued_at)]);
if(action==='reports')r=[['DOT Employers',d.employers||0,'',''],['Owner-Operators',d.owner_operators||0,'','']];
return r}
async function load(){const c=cfg[page];if(!c)return;$('#pageTitle').textContent=c[1];$('#dotHeaders').innerHTML=c[2].map(x=>`<th>${esc(x)}</th>`).join('');const d=await call(c[0]);const r=rows(c[0],d);$('#recordCount').textContent=String(r.length);$('#dotRows').innerHTML=r.length?r.map(x=>`<tr>${x.map(v=>`<td>${typeof v==='string'?v:esc(v)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="4"><div class="ep-business-empty">No records found.</div></td></tr>`}
function error(e){window.S4UUI?.modal?window.S4UUI.modal({title:'DOT Management',message:e.message||String(e),type:'error',confirmText:'Close'}):console.error(e)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>load().catch(error),{once:true});else load().catch(error);
})();
