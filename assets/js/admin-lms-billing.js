(()=>{
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const state={db:null,invoices:[],services:[],items:[],editingId:null,managingId:null,lastFocus:null};
  const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(v||0));
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const human=v=>String(v||"").replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
  const today=()=>new Date().toISOString().slice(0,10);
  const plusDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};

  document.addEventListener("DOMContentLoaded",init,{once:true});

  async function client(){
    for(let i=0;i<50;i++){
      try{
        if(typeof window.getScreenings4uSupabase==="function"){
          const c=await window.getScreenings4uSupabase(); if(c?.functions)return c;
        }
        if(window.screenings4uSupabase?.functions)return window.screenings4uSupabase;
      }catch(_){ }
      await new Promise(r=>setTimeout(r,60));
    }
    throw Error("Supabase client is unavailable.");
  }

  async function waitForAdmin(){
    if(window.S4UPortalGuard?.waitForAdmin){const s=await window.S4UPortalGuard.waitForAdmin();if(s?.user?.id)return s;}
    if(window.S4UAuth?.requireAuth){const s=await window.S4UAuth.requireAuth({portal:"admin",loginPage:"admin-login.html"});if(s?.user?.id)return s;}
    throw Error("Training administrator authentication is required.");
  }

  async function api(body){
    const {data,error}=await state.db.functions.invoke("lms-admin-billing",{body});
    if(error){
      let message=error.message||"Training billing request failed.";
      try{const r=error.context;if(r?.clone){const j=await r.clone().json();if(j?.error)message=j.error}}catch(_){ }
      throw Error(message);
    }
    if(data?.error)throw Error(data.error);
    return data||{};
  }

  async function init(){
    bind();
    try{
      state.db=await client();
      await waitForAdmin();
      await load();
    }catch(e){fail(e);}
  }

  function bind(){
    $("#refreshBilling")?.addEventListener("click",async e=>{const b=e.currentTarget;b.disabled=true;try{await load();message("Training billing refreshed.");}catch(err){fail(err)}finally{b.disabled=false}});
    $("#createInvoice")?.addEventListener("click",()=>openEditor());
    $("#exportInvoices")?.addEventListener("click",exportCsv);
    $("#invoiceSearch")?.addEventListener("input",render);
    $("#invoiceStatusFilter")?.addEventListener("change",render);
    $("#invoiceBalanceFilter")?.addEventListener("change",render);
    $("#clearInvoiceFilters")?.addEventListener("click",()=>{$("#invoiceSearch").value="";$("#invoiceStatusFilter").value="all";$("#invoiceBalanceFilter").value="all";render()});
    $("#invoiceRows")?.addEventListener("click",tableClick);
    $("#invoiceEditorForm")?.addEventListener("submit",e=>e.preventDefault());
    $("#billService")?.addEventListener("change",serviceChanged);
    $("#addInvoiceLine")?.addEventListener("click",addLine);
    $("#billLineRows")?.addEventListener("click",lineClick);
    $("#billLineRows")?.addEventListener("change",lineChange);
    $("#saveInvoice")?.addEventListener("click",saveInvoice);
    $$('[data-close-dialog]').forEach(b=>b.addEventListener("click",()=>closeDialog(b.dataset.closeDialog)));
    $("#manageEdit")?.addEventListener("click",()=>{const x=currentManaged();if(!x)return;closeDialog("invoiceManager");openEditor(x)});
    $("#manageDownload")?.addEventListener("click",()=>{const x=currentManaged();if(x)downloadPdf(x)});
    $("#manageCopyLink")?.addEventListener("click",copyPaymentLink);
    $("#manageSend")?.addEventListener("click",sendInvoice);
    $("#managePaid")?.addEventListener("click",markPaid);
    $("#manageVoid")?.addEventListener("click",voidInvoice);
  }

  async function load(){
    const d=await api({action:"bootstrap"});
    state.invoices=Array.isArray(d.invoices)?d.invoices:[];
    state.services=Array.isArray(d.services)?d.services:[];
    populateServices();
    stats();
    render();
    if(state.managingId && state.invoices.some(x=>x.id===state.managingId))renderManager(currentManaged());
  }

  function displayStatus(x){
    const raw=String(x?.status||"draft").toLowerCase();
    if(Number(x?.amount_due||0)<=0||raw==="paid")return "paid";
    if(["void","uncollectible"].includes(raw))return raw;
    if(x?.due_date && x.due_date<today())return "past_due";
    return raw;
  }

  function stats(){
    const invoices=state.invoices;
    const open=invoices.filter(x=>Number(x.amount_due||0)>0&&!["void","uncollectible"].includes(displayStatus(x)));
    const past=invoices.filter(x=>displayStatus(x)==="past_due");
    $("#metricTotal").textContent=String(invoices.length);
    $("#metricOutstanding").textContent=money(open.reduce((a,x)=>a+Number(x.amount_due||0),0));
    $("#metricOutstandingCount").textContent=`${open.length} open invoice${open.length===1?"":"s"}`;
    $("#metricPastDue").textContent=money(past.reduce((a,x)=>a+Number(x.amount_due||0),0));
    $("#metricPastDueCount").textContent=`${past.length} past due`;
    $("#metricCollected").textContent=money(invoices.reduce((a,x)=>a+Number(x.amount_paid||0),0));
    $("#metricDrafts").textContent=String(invoices.filter(x=>String(x.status)==="draft").length);
  }

  function filtered(){
    const q=String($("#invoiceSearch")?.value||"").trim().toLowerCase();
    const st=$("#invoiceStatusFilter")?.value||"all";
    const bal=$("#invoiceBalanceFilter")?.value||"all";
    return state.invoices.filter(x=>{
      const hay=[x.invoice_number,x.customer_name,x.customer_email].filter(Boolean).join(" ").toLowerCase();
      const ds=displayStatus(x),due=Number(x.amount_due||0)>0;
      return (!q||hay.includes(q))&&(st==="all"||ds===st)&&(bal==="all"||(bal==="due"&&due)||(bal==="paid"&&!due));
    });
  }

  function render(){
    const rows=filtered();
    $("#invoiceCount").textContent=`${rows.length} invoice${rows.length===1?"":"s"}`;
    $("#invoiceRows").innerHTML=rows.length?rows.map(x=>{
      const st=displayStatus(x);
      return `<tr>
        <td><strong>${esc(x.invoice_number)}</strong><span class="sub">${esc(x.id.slice(0,8))}</span></td>
        <td><strong>${esc(x.customer_name||"—")}</strong><span class="sub">${esc(x.customer_email||"")}</span></td>
        <td><span class="lms-status ${esc(st)}">${esc(human(st))}</span></td>
        <td>${esc(x.issue_date||"—")}</td><td>${esc(x.due_date||"—")}</td>
        <td class="lms-money">${money(x.total)}</td><td class="lms-money">${money(x.amount_paid)}</td><td class="lms-money"><strong>${money(x.amount_due)}</strong></td>
        <td><div class="lms-row-actions"><button class="lms-row-btn primary" type="button" data-manage="${esc(x.id)}">Manage</button><button class="lms-row-btn" type="button" data-pdf="${esc(x.id)}">PDF</button></div></td>
      </tr>`;
    }).join(""):`<tr><td colspan="9"><div class="lms-empty">No Training invoices match these filters.</div></td></tr>`;
  }

  function tableClick(e){
    const manage=e.target.closest("[data-manage]");if(manage){openManager(manage.dataset.manage);return}
    const pdf=e.target.closest("[data-pdf]");if(pdf){const x=state.invoices.find(v=>v.id===pdf.dataset.pdf);if(x)downloadPdf(x)}
  }

  function populateServices(){
    const s=$("#billService");if(!s)return;
    s.innerHTML='<option value="">Custom line</option>'+state.services.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}${x.sku?` — ${esc(x.sku)}`:""}</option>`).join("");
  }

  function serviceChanged(){
    const x=state.services.find(v=>v.id===$("#billService").value);if(!x)return;
    $("#billLineDescription").value=x.name||"";
    $("#billLinePrice").value=Number(x.price||0).toFixed(2);
  }

  function resetEditor(){
    state.editingId=null;state.items=[];
    $("#invoiceEditorTitle").textContent="Create Invoice";
    $("#billCustomerName").value="";$("#billCustomerEmail").value="";$("#billIssueDate").value=today();$("#billDueDate").value=plusDays(30);
    $("#billAddress1").value="";$("#billAddress2").value="";$("#billCity").value="";$("#billState").value="";$("#billPostal").value="";$("#billStatus").value="draft";
    $("#billTerms").value="Due within 30 days.";$("#billNotes").value="";$("#billService").value="";$("#billLineDescription").value="";$("#billLineQty").value="1";$("#billLinePrice").value="0.00";$("#billLineDiscount").value="0.00";
    drawLines();
  }

  function openEditor(invoice=null){
    resetEditor();
    if(invoice){
      state.editingId=invoice.id;state.items=(invoice.items||[]).map(x=>({service_id:x.service_id||null,description:x.description||"",quantity:Number(x.quantity||1),unit_price:Number(x.unit_price||0),discount_amount:Number(x.discount_amount||0)}));
      $("#invoiceEditorTitle").textContent=`Edit ${invoice.invoice_number}`;
      $("#billCustomerName").value=invoice.customer_name||"";$("#billCustomerEmail").value=invoice.customer_email||"";$("#billIssueDate").value=invoice.issue_date||today();$("#billDueDate").value=invoice.due_date||"";
      $("#billAddress1").value=invoice.billing_address_line_1||"";$("#billAddress2").value=invoice.billing_address_line_2||"";$("#billCity").value=invoice.billing_city||"";$("#billState").value=invoice.billing_state||"";$("#billPostal").value=invoice.billing_postal_code||"";
      $("#billStatus").value=["draft","open","sent"].includes(invoice.status)?invoice.status:"open";$("#billTerms").value=invoice.terms||"";$("#billNotes").value=invoice.notes||"";
      drawLines();
    }
    openDialog("invoiceEditor");setTimeout(()=>$("#billCustomerName")?.focus(),30);
  }

  function addLine(){
    const description=$("#billLineDescription").value.trim();const quantity=Math.max(.01,Number($("#billLineQty").value)||1);const unit_price=Math.max(0,Number($("#billLinePrice").value)||0);const discount_amount=Math.max(0,Number($("#billLineDiscount").value)||0);
    if(!description){message("Enter an invoice item description.","error");$("#billLineDescription").focus();return}
    state.items.push({service_id:$("#billService").value||null,description,quantity,unit_price,discount_amount});
    $("#billService").value="";$("#billLineDescription").value="";$("#billLineQty").value="1";$("#billLinePrice").value="0.00";$("#billLineDiscount").value="0.00";drawLines();
  }

  function lineClick(e){const b=e.target.closest("[data-remove-line]");if(!b)return;state.items.splice(Number(b.dataset.removeLine),1);drawLines()}
  function lineChange(e){const i=Number(e.target.dataset.line),key=e.target.dataset.key;if(!Number.isInteger(i)||!state.items[i]||!key)return;state.items[i][key]=key==="description"?e.target.value:Math.max(0,Number(e.target.value)||0);drawTotals()}
  function totals(){let subtotal=0,discount=0,total=0;for(const x of state.items){const base=Number(x.quantity||0)*Number(x.unit_price||0),d=Math.min(base,Number(x.discount_amount||0));subtotal+=base;discount+=d;total+=base-d}return{subtotal,discount,total}}
  function drawTotals(){const t=totals();$("#billSubtotal").textContent=money(t.subtotal);$("#billDiscountTotal").textContent=money(t.discount);$("#billTotal").textContent=money(t.total)}
  function drawLines(){
    $("#billLineRows").innerHTML=state.items.length?state.items.map((x,i)=>{const base=Number(x.quantity||0)*Number(x.unit_price||0),line=Math.max(0,base-Number(x.discount_amount||0));return `<tr><td><input data-line="${i}" data-key="description" value="${esc(x.description)}"></td><td><input data-line="${i}" data-key="quantity" type="number" min=".01" step=".01" value="${x.quantity}"></td><td><input data-line="${i}" data-key="unit_price" type="number" min="0" step=".01" value="${x.unit_price}"></td><td><input data-line="${i}" data-key="discount_amount" type="number" min="0" step=".01" value="${x.discount_amount||0}"></td><td class="lms-money">${money(line)}</td><td><button class="lms-row-btn" type="button" data-remove-line="${i}">Remove</button></td></tr>`}).join(""):'<tr><td colspan="6"><div class="lms-empty">No invoice items added yet.</div></td></tr>';
    drawTotals();
  }

  function editorPayload(){return{
    customer_name:$("#billCustomerName").value.trim(),customer_email:$("#billCustomerEmail").value.trim(),issue_date:$("#billIssueDate").value,due_date:$("#billDueDate").value||null,status:$("#billStatus").value,
    billing_address_line_1:$("#billAddress1").value.trim(),billing_address_line_2:$("#billAddress2").value.trim(),billing_city:$("#billCity").value.trim(),billing_state:$("#billState").value.trim(),billing_postal_code:$("#billPostal").value.trim(),terms:$("#billTerms").value.trim(),notes:$("#billNotes").value.trim()
  }}

  async function saveInvoice(){
    const invoice=editorPayload();
    if(!invoice.customer_name){message("Customer name is required.","error");return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.customer_email)){message("Enter a valid customer email.","error");return}
    if(!invoice.issue_date){message("Issue date is required.","error");return}
    if(!state.items.length){message("Add at least one invoice item.","error");return}
    const b=$("#saveInvoice");b.disabled=true;b.textContent="Saving…";
    try{
      const d=await api({action:state.editingId?"update_invoice":"create_invoice",id:state.editingId,invoice,items:state.items});
      closeDialog("invoiceEditor");await load();message(`${d.invoice?.invoice_number||"Invoice"} saved.`);if(d.invoice?.id)openManager(d.invoice.id);
    }catch(e){fail(e)}finally{b.disabled=false;b.textContent="Save Invoice"}
  }

  function openManager(id){state.managingId=id;const x=currentManaged();if(!x)return;renderManager(x);openDialog("invoiceManager")}
  function currentManaged(){return state.invoices.find(x=>x.id===state.managingId)||null}
  function renderManager(x){
    const st=displayStatus(x);$("#manageInvoiceTitle").textContent=x.invoice_number;$("#manageInvoiceMeta").textContent=`${x.customer_name||"Customer"} · ${x.customer_email||""}`;
    $("#manageInvoiceBody").innerHTML=`
      <section class="lms-manage-summary"><article><span>Status</span><strong>${esc(human(st))}</strong></article><article><span>Total</span><strong>${money(x.total)}</strong></article><article><span>Paid</span><strong>${money(x.amount_paid)}</strong></article><article><span>Balance Due</span><strong>${money(x.amount_due)}</strong></article></section>
      <div class="lms-manage-grid"><section class="lms-manage-panel"><h3>Customer & Billing</h3><p><strong>${esc(x.customer_name||"—")}</strong><br>${esc(x.customer_email||"")}</p><p>${esc([x.billing_address_line_1,x.billing_address_line_2,x.billing_city,x.billing_state,x.billing_postal_code].filter(Boolean).join(", ")||"No billing address")}</p><p><strong>Issued:</strong> ${esc(x.issue_date||"—")}<br><strong>Due:</strong> ${esc(x.due_date||"—")}</p></section><section class="lms-manage-panel"><h3>Delivery & Activity</h3><p><strong>Sent:</strong> ${esc(x.sent_at?new Date(x.sent_at).toLocaleString():"Not sent")}</p><p><strong>Views:</strong> ${Number(x.view_count||0)}<br><strong>Last viewed:</strong> ${esc(x.last_viewed_at?new Date(x.last_viewed_at).toLocaleString():"Not viewed")}</p><p><strong>Paid:</strong> ${esc(x.paid_at?new Date(x.paid_at).toLocaleString():"Not paid")}</p></section></div>
      <section class="lms-manage-panel" style="margin-top:14px"><h3>Invoice Items</h3><div class="lms-billing-table-wrap"><table class="lms-manage-items"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Discount</th><th>Total</th></tr></thead><tbody>${(x.items||[]).map(i=>`<tr><td>${esc(i.description)}</td><td>${esc(i.quantity)}</td><td>${money(i.unit_price)}</td><td>${money(i.discount_amount)}</td><td>${money(i.line_total)}</td></tr>`).join("")}</tbody></table></div></section>
      ${x.terms?`<section class="lms-manage-panel" style="margin-top:14px"><h3>Terms</h3><p>${esc(x.terms)}</p></section>`:""}${x.notes?`<section class="lms-manage-panel" style="margin-top:14px"><h3>Notes</h3><p>${esc(x.notes)}</p></section>`:""}`;
    const locked=["paid","void"].includes(st);$("#manageEdit").disabled=locked;$("#manageSend").disabled=["paid","void","uncollectible"].includes(st);$("#managePaid").disabled=st==="paid"||st==="void";$("#manageVoid").disabled=st==="paid"||st==="void";$("#manageCopyLink").disabled=st==="void";
  }

  async function copyPaymentLink(){
    const x=currentManaged();if(!x)return;const b=$("#manageCopyLink");b.disabled=true;
    try{const d=await api({action:"payment_link",id:x.id});await copyText(d.checkout_url);message("Secure payment link copied.");}catch(e){fail(e)}finally{b.disabled=displayStatus(x)==="void"}
  }
  async function sendInvoice(){
    const x=currentManaged();if(!x)return;const b=$("#manageSend");b.disabled=true;b.textContent="Sending…";
    try{const d=await api({action:"send_invoice",id:x.id});await load();message(`Invoice sent to ${d.invoice?.customer_email||x.customer_email}.`);renderManager(currentManaged())}catch(e){fail(e)}finally{b.textContent="Send Invoice";const z=currentManaged();b.disabled=z?["paid","void","uncollectible"].includes(displayStatus(z)):false}
  }
  async function markPaid(){
    const x=currentManaged();if(!x)return;if(!await confirmAction("Mark invoice paid",`Mark ${x.invoice_number} paid in full? This records ${money(x.amount_due)} as paid.`))return;
    const b=$("#managePaid");b.disabled=true;try{await api({action:"mark_paid",id:x.id});await load();message(`${x.invoice_number} marked paid.`);renderManager(currentManaged())}catch(e){fail(e)}
  }
  async function voidInvoice(){
    const x=currentManaged();if(!x)return;if(!await confirmAction("Void invoice",`Void ${x.invoice_number}? The payment link will stop accepting payment.`))return;
    const b=$("#manageVoid");b.disabled=true;try{await api({action:"void_invoice",id:x.id});await load();message(`${x.invoice_number} voided.`);renderManager(currentManaged())}catch(e){fail(e)}
  }

  async function confirmAction(title,text){if(window.S4UUI?.confirm)return !!(await window.S4UUI.confirm(text,{title,type:"warning",confirmText:"Continue",cancelText:"Cancel"}));return window.confirm(text)}
  async function copyText(text){if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return}const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}

  function downloadPdf(x){
    try{
      if(!window.jspdf?.jsPDF)throw Error("PDF generator is unavailable.");
      const {jsPDF}=window.jspdf,d=new jsPDF({unit:"pt",format:"letter"});let y=50;
      d.setTextColor(36,79,141);d.setFontSize(18);d.text("screenings4u Training, LLC",48,y);d.setFontSize(24);d.text("INVOICE",564,y,{align:"right"});y+=22;d.setTextColor(35,50,70);d.setFontSize(10);d.text(x.invoice_number,564,y,{align:"right"});y+=36;
      d.setFontSize(11);d.text(`Bill To: ${x.customer_name||"Customer"}`,48,y);y+=15;if(x.customer_email){d.text(x.customer_email,48,y);y+=15}d.text(`Issue Date: ${x.issue_date||"—"}`,48,y);d.text(`Due Date: ${x.due_date||"—"}`,300,y);y+=28;
      d.setFillColor(244,247,251);d.rect(48,y,516,22,"F");d.setFontSize(8);d.setTextColor(36,79,141);d.text("DESCRIPTION",54,y+14);d.text("QTY",355,y+14);d.text("UNIT",420,y+14);d.text("TOTAL",515,y+14);y+=34;
      d.setTextColor(35,50,70);d.setFontSize(9);for(const i of x.items||[]){if(y>700){d.addPage();y=50}d.text(String(i.description||"Training").slice(0,58),54,y);d.text(String(i.quantity||1),355,y);d.text(money(i.unit_price),420,y);d.text(money(i.line_total),515,y);y+=18}
      y+=12;d.setTextColor(36,79,141);d.setFontSize(10);d.text(`Subtotal: ${money(x.subtotal)}`,564,y,{align:"right"});y+=15;if(Number(x.discount_total||0)){d.text(`Discount: -${money(x.discount_total)}`,564,y,{align:"right"});y+=15}d.setFontSize(14);d.text(`Total: ${money(x.total)}`,564,y,{align:"right"});y+=18;d.setFontSize(10);d.text(`Paid: ${money(x.amount_paid)}    Balance Due: ${money(x.amount_due)}`,564,y,{align:"right"});
      if(x.terms){y+=32;d.setTextColor(35,50,70);d.setFontSize(9);d.text("Terms",48,y);y+=13;d.text(d.splitTextToSize(x.terms,500),48,y)}
      d.save(`${x.invoice_number||"training-invoice"}.pdf`);
    }catch(e){fail(e)}
  }

  function exportCsv(){
    const rows=[["Invoice","Customer","Email","Status","Issue Date","Due Date","Total","Paid","Balance Due"]].concat(filtered().map(x=>[x.invoice_number,x.customer_name,x.customer_email,displayStatus(x),x.issue_date,x.due_date,x.total,x.amount_paid,x.amount_due]));
    const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`training-invoices-${today()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
  }

  function openDialog(id){const d=$("#"+id);if(!d)return;state.lastFocus=document.activeElement;d.showModal()}
  function closeDialog(id){const d=$("#"+id);if(d?.open)d.close();if(state.lastFocus?.focus)state.lastFocus.focus()}
  function message(text,type="ok"){const e=$("#billingMessage");if(!e)return;e.textContent=text;e.className=`lms-billing-message show ${type}`;clearTimeout(message.t);message.t=setTimeout(()=>{e.className="lms-billing-message"},7000)}
  function fail(e){console.error("[Training Billing]",e);message(e?.message||String(e),"error")}
})();
