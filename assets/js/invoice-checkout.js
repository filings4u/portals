(()=>{
"use strict";
let db=null,stripe=null,elements=null,invoice=null,token="",invoiceId="";
const $=id=>document.getElementById(id);
const money=(v,c="USD")=>{try{return new Intl.NumberFormat("en-US",{style:"currency",currency:c||"USD"}).format(Number(v||0))}catch{return "$"+Number(v||0).toFixed(2)}};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
document.addEventListener("DOMContentLoaded",init);

async function client(){
  for(let i=0;i<40;i++){
    try{
      if(typeof window.getScreenings4uSupabase==="function"){
        const c=await window.getScreenings4uSupabase(); if(c?.functions)return c;
      }
      if(window.screenings4uSupabase?.functions)return window.screenings4uSupabase;
    }catch(_){}
    await new Promise(r=>setTimeout(r,75));
  }
  return null;
}
async function call(body){
  const {data,error}=await db.functions.invoke("invoice-checkout-actions",{body});
  if(error){
    let m=error.message||"Invoice checkout failed.";
    try{const r=error.context;if(r?.clone){const j=await r.clone().json();if(j?.error)m=j.error}}catch(_){}
    throw Error(m);
  }
  if(data?.error)throw Error(data.error);
  return data;
}
async function init(){
  try{
    db=await client(); if(!db)throw Error("Checkout service is unavailable.");
    const p=new URLSearchParams(location.search);
    invoiceId=p.get("id")||""; token=p.get("token")||"";
    if(!invoiceId||!token)throw Error("This invoice link is invalid.");
    const d=await call({action:"get",id:invoiceId,token});
    invoice=d.invoice; render(invoice);
    $("loading").hidden=true; $("content").hidden=false;
    if(Number(invoice.amount_due||0)>0 && !["paid","void","uncollectible"].includes(String(invoice.status))){
      await setupPayment();
    }else{
      $("paymentForm").hidden=true; $("paidState").hidden=false;
    }
  }catch(e){$("loading").hidden=true;msg(e.message||"Unable to load invoice.","error")}
}
function render(x){
  const c=x.currency||"USD";
  const issuer=x.issuer_legal_name||"screenings4u, LLC",logo=x.issuer_logo_path||"images/logo.png";
  const logoEl=$("checkoutLogo"),issuerEl=$("checkoutIssuerName");
  if(logo){logoEl.src=logo;logoEl.alt=issuer;logoEl.hidden=false;issuerEl.hidden=true}else{logoEl.hidden=true;issuerEl.textContent=issuer;issuerEl.hidden=false}
  if($("paymentIssuer"))$("paymentIssuer").textContent=issuer;
  $("invoiceNumber").textContent=x.invoice_number||"Invoice";
  $("invoiceStatus").textContent=String(x.status||"").replace(/_/g," ").toUpperCase();
  $("amountDue").textContent=money(x.amount_due,c);
  $("billTo").innerHTML=`<strong>${esc(x.customer_name||"")}</strong><br>${esc(x.customer_email||"")}${x.billing_address_line_1?`<br>${esc(x.billing_address_line_1)}`:""}${x.billing_address_line_2?`<br>${esc(x.billing_address_line_2)}`:""}${x.billing_city||x.billing_state||x.billing_postal_code?`<br>${esc([x.billing_city,x.billing_state,x.billing_postal_code].filter(Boolean).join(", "))}`:""}`;
  $("issueDate").textContent=x.issue_date||"—"; $("dueDate").textContent=x.due_date||"—";
  $("items").innerHTML=(x.items||[]).map(i=>`<tr><td>${esc(i.description)}</td><td>${esc(i.quantity)}</td><td>${money(i.unit_price,c)}</td><td>${money(i.line_total,c)}</td></tr>`).join("");
  $("subtotal").textContent=money(x.subtotal,c); $("discount").textContent=money(x.discount_total,c);
  $("paid").textContent=money(x.amount_paid,c);
  $("dueTotal").textContent=money(x.amount_due,c); $("payAmount").textContent=money(x.amount_due,c);
  if(x.terms){$("termsCard").hidden=false;$("terms").textContent=x.terms}
  if(x.notes){$("notesCard").hidden=false;$("notes").textContent=x.notes}
}
async function setupPayment(){
  const d=await call({action:"create_payment",id:invoiceId,token});
  if(!d.publishableKey||!d.clientSecret)throw Error("Secure payment is not configured.");
  stripe=Stripe(d.publishableKey);
  elements=stripe.elements({clientSecret:d.clientSecret});
  elements.create("payment",{layout:"tabs"}).mount("#paymentElement");
  $("paymentForm").hidden=false;
  $("paymentForm").addEventListener("submit",pay,{once:false});
}
async function pay(e){
  e.preventDefault(); const b=$("payButton");
  try{
    b.disabled=true; msg("Processing payment…","ok");
    const {error,paymentIntent}=await stripe.confirmPayment({
      elements,redirect:"if_required",confirmParams:{return_url:location.href}
    });
    if(error)throw Error(error.message||"Payment was not completed.");
    if(!paymentIntent?.id)throw Error("Payment confirmation was not returned.");
    msg("Payment received. Finalizing your invoice…","ok");
    await waitForPaid();
  }catch(err){msg(err.message||"Unable to process payment.","error");b.disabled=false}
}
async function waitForPaid(){
  for(let i=0;i<20;i++){
    const d=await call({action:"status",id:invoiceId,token});
    invoice=d.invoice||invoice; render(invoice);
    if(String(invoice.status)==="paid" || Number(invoice.amount_due||0)<=0){
      $("paymentForm").hidden=true; $("paidState").hidden=false;
      msg(`Payment received. A receipt from ${invoice.issuer_legal_name||"screenings4u, LLC"} has been emailed to you.`,"ok");
      return;
    }
    await new Promise(r=>setTimeout(r,1000));
  }
  $("paymentForm").hidden=true;
  msg("Payment was received and is still being finalized. Refresh this page in a moment.","ok");
}
function msg(t,type){const e=$("message");e.textContent=t;e.className=`checkout-message show ${type}`}
})();