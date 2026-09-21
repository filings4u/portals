
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const END='https://wyezpseboxbmkedvbmyx.supabase.co/functions/v1/dot-enterprise-management';
const KEY='sb_publishable__BLewZS6h2V4yUczky-BTQ_EemiOdDL';
const agency=String(document.body.dataset.dotAgency||'').toUpperCase();
const state={data:null};

const META={
 FMCSA:{label:'Federal Motor Carrier Safety Administration',reg:'49 CFR Part 382',worker:'CDL drivers / safety-sensitive CMV operations',
   categories:[['cdl_driver','CDL Driver']],
   config:[
    ['clearinghouse_account_identifier','Clearinghouse account / reference'],
    ['new_entrant_status','New Entrant status'],
    ['consortium_mode','Random program / consortium mode']
   ]},
 FAA:{label:'Federal Aviation Administration',reg:'14 CFR Part 120',worker:'Covered aviation safety-sensitive employees and contractors',
   categories:[['part_121_135','Part 121 / 135'],['part_91_147','Part 91.147'],['part_145','Part 145'],['air_traffic_control','Air Traffic Control'],['contractor','Contractor']],
   config:[
    ['authorization_type','Program authorization type (A449 / A049 / Registration)'],
    ['authorization_number','Certificate / authorization number'],
    ['contractor_verification','Contractor program verification'],
    ['program_registration_status','Program registration status']
   ]},
 FRA:{label:'Federal Railroad Administration',reg:'49 CFR Part 219',worker:'Covered service, maintenance-of-way, mechanical and other regulated railroad employees',
   categories:[['covered_service','Covered Service'],['maintenance_of_way','Maintenance of Way'],['mechanical','Mechanical']],
   config:[
    ['railroad_reporting_mark','Railroad reporting mark'],
    ['annual_employee_hours','Annual employee hours'],
    ['regulated_employee_count','Regulated employee count'],
    ['independent_contractor_program','Independent contractor program']
   ]},
 FTA:{label:'Federal Transit Administration',reg:'49 CFR Part 655',worker:'Covered transit safety-sensitive employees',
   categories:[['recipient','Recipient'],['subrecipient','Subrecipient'],['contractor','Contractor']],
   config:[
    ['recipient_type','Recipient / contractor type'],
    ['fta_recipient_id','FTA recipient identifier'],
    ['policy_adoption_date','Policy adoption date'],
    ['designated_employer_representative','Designated Employer Representative']
   ]},
 PHMSA:{label:'Pipeline and Hazardous Materials Safety Administration',reg:'49 CFR Part 199',worker:'Covered pipeline/LNG operations, maintenance and emergency-response functions',
   categories:[['part_192','Part 192'],['part_193','Part 193'],['part_195','Part 195'],['contractor','Contractor']],
   config:[
    ['operator_id','Operator identifier'],
    ['pipeline_part','Pipeline regulatory part'],
    ['anti_drug_plan_date','Anti-drug plan effective date'],
    ['alcohol_misuse_plan_date','Alcohol misuse plan effective date']
   ]},
 USCG:{label:'United States Coast Guard',reg:'46 CFR Parts 4 & 16; 33 CFR Part 95',worker:'Covered merchant mariners / safety-sensitive marine personnel',
   categories:[['credentialed_mariner','Credentialed Mariner'],['safety_sensitive_crewmember','Safety-Sensitive Crewmember'],['marine_employer_employee','Marine Employer Employee']],
   config:[
    ['marine_employer_identifier','Marine employer identifier'],
    ['vessel_count','Commercial vessel count'],
    ['smi_testing_arrangements','Serious Marine Incident testing arrangements'],
    ['periodic_testing_program','Periodic testing program']
   ]}
};
const M=META[agency]||META.FMCSA;

async function client(){for(let i=0;i<40;i++){const c=window.screenings4uSupabase||window.supabaseClient;if(c?.auth?.getSession)return c;await new Promise(r=>setTimeout(r,50))}throw new Error('Supabase client unavailable.')}
async function call(action,extra={}){const c=await client(),{data:{session}}=await c.auth.getSession();if(!session)throw new Error('Your staff session has expired.');const r=await fetch(END,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`,'apikey':KEY},body:JSON.stringify({action,agency_code:agency,...extra})});const d=await r.json().catch(()=>({}));if(!r.ok||d.error)throw new Error(d.error||`Request failed (${r.status}).`);return d}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d)};
const badge=v=>`<span class="ep-business-pill">${esc(String(v||'—').replaceAll('_',' '))}</span>`;
const emp=id=>(state.data?.employers||[]).find(x=>x.id===id);
const empName=id=>emp(id)?.legal_name||'—';
const workerName=x=>[x.first_name,x.last_name].filter(Boolean).join(' ')||x.employee_number||'—';
function toast(m,t='success'){window.S4UUI?.toast?.(m,t)}
function fail(e){if(window.S4UUI?.modal)window.S4UUI.modal({title:`${agency} Management`,message:e.message||String(e),type:'error',confirmText:'Close'});else console.error(e)}
function form(title,message,fields,confirmText,onSubmit){if(!window.S4UUI?.formModal)throw new Error('Branded form modal is unavailable.');window.S4UUI.formModal({title,message,fields,confirmText,onSubmit})}
function opts(list,value,label){return [{value:'',label:'Select'}].concat(list.map(x=>({value:x[value],label:typeof label==='function'?label(x):x[label]})))}
function rowButton(label,action,id){return `<button type="button" class="ep-business-btn ep-agency-row" data-action="${esc(action)}" data-id="${esc(id)}">${esc(label)}</button>`}

function renderHeader(){
 $('#agencyEyebrow').textContent=`DOT Agency Management · ${agency}`;
 $('#agencyTitle').textContent=`${agency} Management`;
 $('#agencyDescription').textContent=`Manage ${M.label} company registrations, covered workforce, programs, testing, random activity, post-accident events, compliance and agency records.`;
 $('#regulationRef').textContent=state.data?.agency?.primary_regulation||M.reg;
 $('#coveredWorkforce').textContent=state.data?.agency?.metadata?.covered_workforce||M.worker;
 const md=state.data?.agency?.metadata||{};
 let drug=md['2026_drug_rate'],alc=md['2026_alcohol_rate'];
 if(agency==='FRA')drug='Category-based';
 $('#drugRate').textContent=drug==null?'See agency rule':`${drug}${typeof drug==='number'?'%':''}`;
 $('#alcoholRate').textContent=alc==null?'Not a random alcohol rate':`${alc}%`;
}

function renderMetrics(){
 const d=state.data||{},open=(d.compliance_cases||[]).filter(x=>!['resolved','closed'].includes(String(x.status))).length;
 $('#mEmployers').textContent=(d.employers||[]).length;
 $('#mWorkers').textContent=(d.employees||[]).length;
 $('#mPrograms').textContent=(d.programs||[]).length;
 $('#mCompliance').textContent=open;
}

function registrationRows(){
 const d=state.data||[], regs=d.registrations||[];
 const map=new Map(regs.map(r=>[r.employer_id,r]));
 return (state.data.employers||[]).map(e=>{
   const r=map.get(e.id),cfg=r?.configuration||{};
   return `<tr><td><strong>${esc(e.legal_name)}</strong><span class="sub">${esc([e.dot_number&&`USDOT ${e.dot_number}`,e.state].filter(Boolean).join(' · ')||'—')}</span></td><td>${esc(r?.account_identifier||'—')}<span class="sub">${esc(r?.employee_category||'—')}</span></td><td>${badge(r?.status||'not configured')}</td><td>${fmt(r?.effective_date)}</td><td>${rowButton(r?'Manage':'Configure','registration',e.id)}</td></tr>`
 }).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No employers assigned to this agency.</div></td></tr>';
}
function workerRows(){return (state.data?.employees||[]).map(x=>`<tr><td><strong>${esc(workerName(x))}</strong><span class="sub">${esc(x.employee_number||'—')}</span></td><td>${esc(empName(x.employer_id))}</td><td>${esc(x.job_title||'—')}</td><td>${esc(x.dot_agency||agency)}</td><td>${badge(x.employment_status)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No covered workers found.</div></td></tr>'}
function programRows(){return (state.data?.programs||[]).map(x=>`<tr><td><strong>${esc(x.name)}</strong><span class="sub">${esc(x.regulatory_category||'General')}</span></td><td>${esc(empName(x.employer_id))}</td><td>${esc(x.testing_method||'—')}</td><td>${esc(x.drug_random_rate==null?'—':`${x.drug_random_rate}%`)} / ${esc(x.alcohol_random_rate==null?'—':`${x.alcohol_random_rate}%`)}</td><td>${rowButton('Manage','program',x.id)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No agency programs found.</div></td></tr>'}
function testingRows(){return (state.data?.testing_orders||[]).slice(0,250).map(x=>`<tr><td>${esc(x.order_number||x.id)}</td><td>${esc(empName(x.employer_id))}</td><td>${esc(String(x.reason||'—').replaceAll('_',' '))}</td><td>${esc(x.test_type||'—')}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No testing orders found.</div></td></tr>'}
function accidentRows(){return (state.data?.post_accident_events||[]).slice(0,250).map(x=>`<tr><td>${fmt(x.occurred_at)}</td><td>${esc(empName(x.employer_id))}</td><td>${esc(x.accident_type||'Agency event')}</td><td>${badge(x.testing_required===true?'testing required':x.testing_required===false?'not required':'pending')}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No post-accident events found.</div></td></tr>'}
function complianceRows(){return (state.data?.compliance_cases||[]).slice(0,250).map(x=>`<tr><td>${esc(x.case_number||x.id)}</td><td>${esc(empName(x.employer_id))}</td><td>${esc(x.event_type||'—')}</td><td>${badge(x.priority)}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No compliance cases found.</div></td></tr>'}
function selectionRows(){return (state.data?.selections||[]).slice(0,250).map(x=>`<tr><td>${fmt(x.selection_date)}</td><td>${esc(x.pool_id||'—')}</td><td>${esc(x.population_size||0)}</td><td>${esc(x.drug_selection_count||0)} / ${esc(x.alcohol_selection_count||0)}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="ep-business-empty">No random selection events found.</div></td></tr>'}

function configFields(reg={}){
 const cfg=reg.configuration||{};
 return M.config.map(([name,label])=>({name:`cfg_${name}`,label,value:cfg[name]??''}));
}
function registrationForm(employerId){
 const reg=(state.data?.registrations||[]).find(x=>x.employer_id===employerId)||{};
 const e=emp(employerId)||{};
 const fields=[
  {name:'employer_id',label:'Employer',type:'select',value:employerId,required:true,options:opts(state.data?.employers||[],'id','legal_name')},
  {name:'account_identifier',label:'Agency account / identifier',value:reg.account_identifier||''},
  {name:'employee_category',label:'Regulated category',type:'select',value:reg.employee_category||M.categories[0]?.[0]||'general',options:M.categories.map(([value,label])=>({value,label}))},
  {name:'effective_date',label:'Effective date',type:'date',value:reg.effective_date||new Date().toISOString().slice(0,10)},
  {name:'is_primary',label:'Primary DOT agency',type:'select',value:String(!!reg.is_primary),options:[{value:'false',label:'No'},{value:'true',label:'Yes'}]},
  {name:'status',label:'Status',type:'select',value:reg.status||'active',options:['active','suspended','inactive'].map(v=>({value:v,label:v}))},
  ...configFields(reg)
 ];
 form(`${agency} Employer Configuration`,`${e.legal_name||'Employer'} · ${M.reg}. Agency-specific values are stored with this employer's ${agency} regulatory record.`,fields,'Save Agency Configuration',async v=>{
   const configuration={};for(const [name] of M.config)configuration[name]=v[`cfg_${name}`]||null;
   await call('save_agency_registration',{registration:{employer_id:v.employer_id,agency_code:agency,account_identifier:v.account_identifier,employee_category:v.employee_category,effective_date:v.effective_date,is_primary:v.is_primary==='true',status:v.status,configuration}});
   toast(`${agency} employer configuration saved.`);await load();
 });
}
function programForm(row={}){
 form(row.id?`Manage ${agency} Program`:`Add ${agency} Program`,`Agency-specific testing program for ${M.label}. Active regulatory rates are applied automatically where configured.`,[
  {name:'employer_id',label:'Employer',type:'select',value:row.employer_id||'',required:true,options:opts(state.data?.employers||[],'id','legal_name')},
  {name:'name',label:'Program name',value:row.name||`${agency} Drug & Alcohol Program`,required:true},
  {name:'regulatory_category',label:'Regulatory category',type:'select',value:row.regulatory_category||M.categories[0]?.[0]||'',options:M.categories.map(([value,label])=>({value,label}))},
  {name:'testing_method',label:'Testing method',value:row.testing_method||'Urine / Breath'},
  {name:'testing_panel',label:'Drug testing panel',value:row.testing_panel||'DOT 5-panel'},
  {name:'testing_frequency',label:'Selection frequency',value:row.testing_frequency||'Quarterly'},
  {name:'effective_date',label:'Effective date',type:'date',value:row.effective_date||new Date().toISOString().slice(0,10)},
  {name:'status',label:'Status',type:'select',value:row.status||'active',options:['draft','active','suspended','inactive'].map(v=>({value:v,label:v}))}
 ],row.id?'Save Program':'Create Program',async v=>{
   await call('save_agency_program',{program:{id:row.id||'',dot_agency:agency,...v,agency_configuration:row.agency_configuration||{}}});
   toast(`${agency} program saved.`);await load();
 });
}
function workerForm(){
 form(`Add ${agency} Covered Worker`,`Create a DOT-covered worker under an employer assigned to ${agency}.`,[
  {name:'employer_id',label:'Employer',type:'select',value:'',required:true,options:opts(state.data?.employers||[],'id','legal_name')},
  {name:'first_name',label:'First name',value:'',required:true},{name:'last_name',label:'Last name',value:'',required:true},
  {name:'employee_number',label:'Employee number',value:''},{name:'email',label:'Email',type:'email',value:''},
  {name:'job_title',label:'Safety-sensitive position',value:''},
  {name:'employee_category',label:'Agency category',type:'select',value:M.categories[0]?.[0]||'',options:M.categories.map(([value,label])=>({value,label}))},
  {name:'employment_status',label:'Status',type:'select',value:'active',options:['active','pending_enrollment','suspended','inactive'].map(v=>({value:v,label:v.replaceAll('_',' ')}))}
 ],'Create Covered Worker',async v=>{
   await call('save_driver',{driver:{...v,dot_agency:agency,safety_sensitive:true,dot_covered:true}});
   toast(`${agency} covered worker created.`);await load();
 });
}

function wireRows(){
 $$('.ep-agency-row').forEach(b=>b.addEventListener('click',()=>{
  const a=b.dataset.action,id=b.dataset.id;
  if(a==='registration')registrationForm(id);
  if(a==='program')programForm((state.data?.programs||[]).find(x=>x.id===id)||{});
 }));
}
function wireTabs(){
 $$('.ep-agency-tab').forEach(b=>b.addEventListener('click',()=>{
  $$('.ep-agency-tab').forEach(x=>x.classList.toggle('active',x===b));
  $$('.ep-agency-panel').forEach(x=>x.classList.toggle('active',x.dataset.panel===b.dataset.tab));
 }));
}
function render(){
 renderHeader();renderMetrics();
 $('#registrationRows').innerHTML=registrationRows();
 $('#workerRows').innerHTML=workerRows();
 $('#programRows').innerHTML=programRows();
 $('#testingRows').innerHTML=testingRows();
 $('#accidentRows').innerHTML=accidentRows();
 $('#complianceRows').innerHTML=complianceRows();
 $('#selectionRows').innerHTML=selectionRows();
 const rules=state.data?.regulatory_rules||[];
 $('#ruleCopy').textContent=rules.length?`${rules[0].rule_name} · Effective ${fmt(rules[0].effective_date)}`:`${M.reg} · No local rate override record found.`;
 const pa=state.data?.post_accident_rules||[];
 $('#postAccidentCopy').textContent=pa.length?`${pa[0].rule_name} · ${pa[0].regulation_reference}`:`Use current ${agency} post-accident rules and 49 CFR Part 40 procedures.`;
 wireRows();wireTabs();
}
async function load(){state.data=await call('agency_workspace');render()}
function init(){
 $('#refreshAgency')?.addEventListener('click',()=>load().catch(fail));
 $('#addRegistration')?.addEventListener('click',()=>{const first=state.data?.employers?.[0];if(!first)return fail(new Error(`No ${agency} employers are available.`));registrationForm(first.id)});
 $('#addProgram')?.addEventListener('click',()=>programForm({}));
 $('#addWorker')?.addEventListener('click',workerForm);
 load().catch(fail);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80),{once:true});else setTimeout(init,80);
})();
