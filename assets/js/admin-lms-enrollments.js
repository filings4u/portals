(()=>{
  const $=x=>document.getElementById(x);
  let db,R=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function call(body){const {data,error}=await db.functions.invoke('admin-lms-enrollment-actions',{body});if(error)throw error;if(data?.error)throw Error(data.error);return data}
  function fmt(v){return v?new Date(v).toLocaleDateString():'—'}
  function deriveState(x,progress){
    const raw=String(x.status||'').toLowerCase();
    if(raw==='cancelled') return 'cancelled';
    if(x.completed_at||raw==='completed') return 'completed';
    if(x.expires_at&&new Date(x.expires_at).getTime()<=Date.now()) return 'expired';
    if(progress<=0&&!x.started_at) return 'not-started';
    return 'active';
  }
  function norm(x){
    const p=x.profile||{},c=x.course||{},progress=Number(x.progress_percent||0);
    return {...x,
      name:p.display_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||p.email||'Learner',
      email:p.email||'',courseTitle:c.title||'Course',progress,
      viewStatus:deriveState(x,progress)
    };
  }
  function draw(){
    const q=$('enrollmentSearch').value.toLowerCase(),cf=$('courseFilter').value,sf=$('statusFilter').value;
    const rows=R.filter(x=>(!q||[x.name,x.email,x.courseTitle].join(' ').toLowerCase().includes(q))&&(cf==='all'||x.course_id===cf)&&(sf==='all'||x.viewStatus===sf));
    $('enrollmentList').innerHTML=rows.map(x=>`<tr><td><b>${esc(x.name)}</b><br><small>${esc(x.email)}</small></td><td>${esc(x.courseTitle)}<br><small>${esc(x.assignment_source||'training')}</small></td><td>${Math.round(x.progress)}%</td><td><span class="badge ${esc(x.viewStatus)}">${esc(x.viewStatus.replaceAll('-',' '))}</span></td><td>${esc(fmt(x.expires_at))}</td><td><a class="mg-btn" href="admin-lms-learner.html?user=${encodeURIComponent(x.user_id)}&enrollment=${encodeURIComponent(x.id)}">Manage</a></td></tr>`).join('')||'<tr><td colspan="6" class="mg-empty">No enrollments match the current filters.</td></tr>';
  }
  function renderStats(){
    $('statTotal').textContent=R.length;
    $('statActive').textContent=R.filter(x=>x.viewStatus==='active').length;
    $('statCompleted').textContent=R.filter(x=>x.viewStatus==='completed').length;
    $('statNotStarted').textContent=R.filter(x=>x.viewStatus==='not-started').length;
  }
  async function load(){
    const d=await call({action:'list'});
    R=(d.enrollments||[]).map(norm);
    renderStats();
    const courses=[...new Map(R.map(x=>[x.course_id,x.courseTitle])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
    $('courseFilter').innerHTML='<option value="all">All Courses</option>'+courses.map(([id,n])=>`<option value="${esc(id)}">${esc(n)}</option>`).join('');
    draw();
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    db=await getScreenings4uSupabase();
    $('enrollmentSearch').oninput=draw;
    $('courseFilter').onchange=draw;
    $('statusFilter').onchange=draw;
    try{await load()}catch(e){$('enrollmentList').innerHTML=`<tr><td colspan="6">${esc(e.message)}</td></tr>`}
  });
})();