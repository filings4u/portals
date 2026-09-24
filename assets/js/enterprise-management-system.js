(()=>{'use strict';
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const FONT_KEY='s4u-enterprise-font-scale',FONT_STEPS=[.82,.92,1,1.1,1.2];
function fontValue(){const v=Number(localStorage.getItem(FONT_KEY));return FONT_STEPS.includes(v)?v:.92}
function applyFont(v){document.documentElement.style.setProperty('--s4u-font-scale',String(v));localStorage.setItem(FONT_KEY,String(v));qsa('.s4u-font-sizer button').forEach(b=>b.classList.toggle('active',Number(b.dataset.scale)===v))}
function addFontSizer(){const host=qs('.ep-top-actions')||qs('.admin-lms-topbar')||qs('header');if(!host||qs('.s4u-font-sizer'))return;const wrap=document.createElement('div');wrap.className='s4u-font-sizer';wrap.setAttribute('aria-label','Portal font size');wrap.innerHTML='<span>Text</span>'+FONT_STEPS.map((v,i)=>`<button type="button" data-scale="${v}" title="${i<2?'Smaller':i===2?'Default':'Larger'} text">${i===0?'A−':i===1?'A':i===2?'A':i===3?'A+':'A++'}</button>`).join('');wrap.addEventListener('click',e=>{const b=e.target.closest('button[data-scale]');if(b)applyFont(Number(b.dataset.scale))});host.insertBefore(wrap,host.querySelector('.ep-user-menu')||null);applyFont(fontValue())}
function stack(){let s=qs('.s4u-toast-stack');if(!s){s=document.createElement('div');s.className='s4u-toast-stack';s.setAttribute('aria-live','polite');document.body.appendChild(s)}return s}
function notify(message,type='info',title=''){if(!message)return;const t=document.createElement('div');t.className=`s4u-toast ${type}`;const heading=title||(type==='success'?'Success':type==='error'?'Action needed':type==='warning'?'Please review':'screenings4u Enterprise');t.innerHTML=`<div class="s4u-toast-copy"><strong>${esc(heading)}</strong><p>${esc(message)}</p></div><button class="s4u-toast-close" type="button" aria-label="Dismiss">×</button>`;const remove=()=>{t.classList.add('leaving');setTimeout(()=>t.remove(),190)};t.querySelector('button').onclick=remove;stack().appendChild(t);setTimeout(remove,type==='error'?9000:5500)}
window.S4UNotify={show:notify,success:m=>notify(m,'success'),error:m=>notify(m,'error'),warning:m=>notify(m,'warning')};
window.alert=(m)=>notify(m,'info');
function normalizeInvokeError(error){if(!error)return error;try{const ctx=error.context;if(ctx&&typeof ctx.clone==='function'){return ctx.clone().json().then(j=>{if(j?.error)error.message=j.error;else if(j?.message)error.message=j.message;return error}).catch(()=>error)}}catch{}return Promise.resolve(error)}
function patchInvoke(){const sb=window.screenings4uSupabase;if(!sb?.functions?.invoke||sb.functions.__s4uWrapped)return false;const orig=sb.functions.invoke.bind(sb.functions);sb.functions.invoke=async function(...args){const res=await orig(...args);if(res?.error)await normalizeInvokeError(res.error);return res};sb.functions.__s4uWrapped=true;return true}
function alertToToast(node){if(!(node instanceof HTMLElement)||!node.matches('.ecp-alert'))return;const text=node.textContent?.trim();if(text)notify(text,node.classList.contains('error')?'error':'success');node.remove()}
function currentPageRoot(){return qs('.ecp-page')||qs('.admin-lms-main')||qs('main')||document.body}
let confirmActive=null;
window.S4UConfirm=function(message,options={}){if(confirmActive)return Promise.resolve(false);return new Promise(resolve=>{confirmActive={resolve};const root=currentPageRoot(),children=[...root.children];children.forEach(x=>x.classList.add('s4u-route-hidden'));const box=document.createElement('section');box.className='s4u-confirm-route';box.innerHTML=`<div class="s4u-route-head"><div><h1>${esc(options.title||'Confirm management action')}</h1><p>This action will update the authoritative business record.</p></div></div><div class="s4u-route-body"><div class="s4u-confirm-message">${esc(message)}</div><div class="s4u-route-actions"><button class="ecp-btn" type="button" data-no>Cancel</button><button class="ecp-btn primary" type="button" data-yes>${esc(options.confirmText||'Continue')}</button></div></div>`;root.appendChild(box);const u=new URL(location.href);u.searchParams.set('confirm','1');history.pushState({s4uConfirm:true},'',u);const finish=yes=>{box.remove();children.forEach(x=>x.classList.remove('s4u-route-hidden'));const url=new URL(location.href);url.searchParams.delete('confirm');history.replaceState({},'',url);confirmActive=null;resolve(yes)};box.querySelector('[data-no]').onclick=()=>finish(false);box.querySelector('[data-yes]').onclick=()=>finish(true)});};
let routed=null;
function routeModal(modal){if(routed||!modal?.id||modal.id==='epSearchModal')return;const dialog=modal.querySelector('.ecp-dialog,.modal-dialog,[role="dialog"]')||modal.firstElementChild;if(!dialog)return;const root=currentPageRoot(),children=[...root.children];children.forEach(x=>x.classList.add('s4u-route-hidden'));const holder=document.createElement('section');holder.className='s4u-management-route';holder.dataset.modalId=modal.id;holder.innerHTML='<div class="s4u-route-head"><div><h1>Management</h1><p>Complete this management action, then return to the workspace.</p></div><button class="s4u-route-back" type="button">← Back</button></div><div class="s4u-route-body"></div>';holder.querySelector('.s4u-route-body').appendChild(dialog);root.appendChild(holder);modal.classList.remove('open','active','show');modal.classList.add('s4u-routed-modal');const u=new URL(location.href);u.searchParams.set('manage',modal.id);history.pushState({s4uManage:modal.id},'',u);routed={modal,dialog,holder,children};const back=()=>closeRoute();holder.querySelector('.s4u-route-back').onclick=back;qsa('[data-close],.modal-close',holder).forEach(b=>b.addEventListener('click',e=>{e.preventDefault();back()},{capture:true}));}
function closeRoute(){if(!routed)return;const {modal,dialog,holder,children}=routed;modal.appendChild(dialog);holder.remove();modal.classList.remove('s4u-routed-modal','open','active','show');children.forEach(x=>x.classList.remove('s4u-route-hidden'));const u=new URL(location.href);u.searchParams.delete('manage');history.replaceState({},'',u);routed=null}
function observe(){
  const obs=new MutationObserver(ms=>{
    for(const m of ms){
      for(const n of m.addedNodes||[]){
        if(n instanceof HTMLElement){
          if(n.matches('.ecp-alert')) alertToToast(n);
          qsa('.ecp-alert',n).forEach(alertToToast);
        }
      }
      if(m.type==='attributes'&&m.target instanceof HTMLElement){
        const el=m.target;
        if(routed&&el===routed.modal&&(!el.classList.contains('open')&&!el.classList.contains('show')&&!el.classList.contains('active')||el.getAttribute('aria-hidden')==='true')){
          closeRoute();
          continue;
        }
        if(el.matches('.ecp-route-panel,.modal,[class*="-modal"],[role="dialog"],[aria-modal="true"]')){
          const visuallyOpen=el.classList.contains('open')||el.classList.contains('show')||el.classList.contains('active')||el.getAttribute('aria-hidden')==='false'||(m.attributeName==='hidden'&&!el.hidden)||(!el.hidden&&el.style.display&&el.style.display!=='none');
          if(visuallyOpen){
            const target=el.matches('[role="dialog"],[aria-modal="true"]')?(el.closest('.ecp-route-panel,.modal,[class*="-modal"]')||el):el;
            routeModal(target);
          }
        }
      }
    }
  });
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style','aria-hidden']});
  qsa('.ecp-alert').forEach(alertToToast);
  qsa('.ecp-route-panel.open,.modal.open,.modal.show,[class*="-modal"][aria-hidden="false"],[role="dialog"][aria-hidden="false"],[aria-modal="true"][aria-hidden="false"]').forEach(routeModal);
}
function wire(){applyFont(fontValue());addFontSizer();patchInvoke();observe();const timer=setInterval(()=>{addFontSizer();if(patchInvoke())clearInterval(timer)},300);setTimeout(()=>clearInterval(timer),10000)}
window.addEventListener('popstate',()=>{if(routed)closeRoute()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();
