(()=>{
  "use strict";

  const money=(v,c="USD")=>{try{return new Intl.NumberFormat("en-US",{style:"currency",currency:c||"USD"}).format(Number(v||0))}catch{return `$${Number(v||0).toFixed(2)}`}};
  const issuerName=r=>r?.issuer_legal_name||r?.metadata?.issuer_legal_name||"screenings4u, LLC";
  const logoPath=r=>r?.issuer_logo_path||r?.metadata?.issuer_logo_path||"images/logo.png";
  const brandColor=r=>r?.issuer_brand_color||r?.metadata?.issuer_brand_color||"#24467f";
  const entityCode=r=>String(r?.issuer_entity_code||r?.metadata?.entity_code||"screenings4u").toLowerCase();
  const entitySite=r=>({training:"training.screenings4u.com",dot:"dot.screenings4u.com",workforce:"workforce.screenings4u.com",screenings4u:"screenings4u.com",testing:"screenings4u.com"}[entityCode(r)]||"screenings4u.com");
  const parentName="Roseland Companies, LLC";

  async function logoData(record){
    const path=logoPath(record); if(!path)return null;
    try{const r=await fetch(path,{cache:"no-store"});if(!r.ok)return null;const b=await r.blob();return await new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b)})}catch(_){return null}
  }
  function rgb(hex){const h=String(hex||"#24467f").replace("#","");return /^[0-9a-f]{6}$/i.test(h)?[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]:[36,70,127]}
  function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
  function addressLines(r){const out=[];if(r?.billing_address_line_1)out.push(String(r.billing_address_line_1));if(r?.billing_address_line_2)out.push(String(r.billing_address_line_2));const city=[r?.billing_city,r?.billing_state,r?.billing_postal_code].filter(Boolean).join(r?.billing_city&&r?.billing_state?", ":" ");if(city)out.push(city);if(r?.billing_country&&String(r.billing_country).toUpperCase()!=="US")out.push(String(r.billing_country));return out}
  function statusLabel(v){return String(v||"draft").replaceAll("_"," ").toUpperCase()}
  function checkoutUrl(r){return r?.id&&r?.public_token?`https://portals.screenings4u.com/invoice-checkout.html?id=${encodeURIComponent(r.id)}&token=${encodeURIComponent(r.public_token)}`:""}

  function addInvoiceHeader(d,r,logo,brand,pageNo){
    const issuer=issuerName(r),site=entitySite(r),light=mix(brand,[255,255,255],.92);
    d.setFillColor(...brand);d.rect(0,0,612,11,"F");
    if(logo){try{d.addImage(logo,undefined,46,34,190,62,undefined,"FAST")}catch(_){d.setTextColor(...brand);d.setFont("helvetica","bold");d.setFontSize(18);d.text(issuer,46,62)}}
    else{d.setTextColor(...brand);d.setFont("helvetica","bold");d.setFontSize(18);d.text(issuer,46,62)}
    d.setTextColor(37,50,69);d.setFont("helvetica","bold");d.setFontSize(28);d.text("INVOICE",566,55,{align:"right"});
    d.setFont("helvetica","normal");d.setFontSize(9);d.setTextColor(92,108,129);d.text(r.invoice_number||"Invoice",566,72,{align:"right"});
    d.setFontSize(8);d.text(site,566,86,{align:"right"});
    d.setDrawColor(...mix(brand,[255,255,255],.78));d.line(46,108,566,108);
    if(pageNo>1){d.setFillColor(...light);d.roundedRect(46,122,520,28,5,5,"F");d.setTextColor(...brand);d.setFont("helvetica","bold");d.setFontSize(9);d.text(`${r.invoice_number||"Invoice"} - Itemized charges continued`,58,140)}
  }
  function addInvoiceFooter(d,r,page,pages,brand){
    const issuer=issuerName(r),site=entitySite(r);
    d.setDrawColor(222,229,238);d.line(46,744,566,744);
    d.setFont("helvetica","normal");d.setFontSize(7.5);d.setTextColor(107,122,143);
    d.text(`${issuer}  |  ${site}  |  A ${parentName} company`,46,760);
    d.text(`Page ${page} of ${pages}`,566,760,{align:"right"});
  }
  function addItemTableHeader(d,y,brand){
    d.setFillColor(...brand);d.roundedRect(46,y,520,25,4,4,"F");
    d.setTextColor(255,255,255);d.setFont("helvetica","bold");d.setFontSize(7.5);
    d.text("ITEM / DESCRIPTION",58,y+16);d.text("QTY",365,y+16,{align:"right"});d.text("RATE",442,y+16,{align:"right"});d.text("DISCOUNT",500,y+16,{align:"right"});d.text("AMOUNT",556,y+16,{align:"right"});
    return y+34;
  }
  function addInvoicePage(d,r,logo,brand,pageNo){addInvoiceHeader(d,r,logo,brand,pageNo);return pageNo===1?128:164}

  async function invoicePdf(record){
    if(!window.jspdf?.jsPDF)throw Error("PDF library not loaded.");
    const {jsPDF}=window.jspdf,d=new jsPDF({unit:"pt",format:"letter",compress:true}),logo=await logoData(record),brand=rgb(brandColor(record)),currency=record.currency||"USD";
    const dark=[37,50,69],muted=[99,115,137],soft=mix(brand,[255,255,255],.94),items=record.items||[];
    let page=1,y=addInvoicePage(d,record,logo,brand,page);

    // Invoice identity + balance panel.
    d.setFillColor(...soft);d.roundedRect(46,y,520,72,7,7,"F");
    d.setTextColor(...muted);d.setFont("helvetica","bold");d.setFontSize(7.5);d.text("INVOICE NUMBER",58,y+17);d.text("ISSUE DATE",226,y+17);d.text("DUE DATE",338,y+17);d.text("STATUS",450,y+17);
    d.setTextColor(...dark);d.setFontSize(9.5);d.text(String(record.invoice_number||"-"),58,y+36);d.text(String(record.issue_date||"-"),226,y+36);d.text(String(record.due_date||"-"),338,y+36);
    const status=statusLabel(record.status);d.setFillColor(...(status==="PAID"?[31,138,92]:status==="VOID"?[176,54,45]:brand));d.roundedRect(450,y+24,102,22,11,11,"F");d.setTextColor(255,255,255);d.setFontSize(7.5);d.text(status,501,y+38,{align:"center"});
    d.setTextColor(...muted);d.setFontSize(7.5);d.text("BALANCE DUE",450,y+60);d.setTextColor(...brand);d.setFontSize(13);d.text(money(record.amount_due,currency),552,y+60,{align:"right"});
    y+=92;

    // Issuer and bill-to columns.
    d.setTextColor(...brand);d.setFont("helvetica","bold");d.setFontSize(8);d.text("FROM",46,y);d.text("BILL TO",316,y);
    y+=14;d.setTextColor(...dark);d.setFontSize(10);d.text(issuerName(record),46,y);d.text(String(record.customer_name||"Customer"),316,y);
    d.setFont("helvetica","normal");d.setFontSize(8.5);d.setTextColor(...muted);
    d.text(entitySite(record),46,y+15);d.text("support@screenings4u.com",46,y+28);
    const bill=[record.customer_email,...addressLines(record)].filter(Boolean).map(String);let by=y+15;for(const line of bill){d.text(line,316,by);by+=13}
    y=Math.max(y+54,by+8);

    // Itemized charges.
    d.setTextColor(...brand);d.setFont("helvetica","bold");d.setFontSize(10);d.text("ITEMIZED CHARGES",46,y);y+=10;
    y=addItemTableHeader(d,y,brand);
    items.forEach((x,index)=>{
      const q=Number(x.quantity||1),u=Number(x.unit_price||0),disc=Number(x.discount_amount||0),line=Number(x.line_total??(q*u-disc));
      const desc=d.splitTextToSize(String(x.description||"Service"),270),rowH=Math.max(34,desc.length*11+13);
      if(y+rowH>685){d.addPage();page++;y=addInvoicePage(d,record,logo,brand,page);y=addItemTableHeader(d,y,brand)}
      if(index%2===0){d.setFillColor(249,251,253);d.rect(46,y-7,520,rowH,"F")}
      d.setTextColor(...muted);d.setFont("helvetica","bold");d.setFontSize(7);d.text(String(index+1).padStart(2,"0"),58,y+5);
      d.setTextColor(...dark);d.setFont("helvetica","normal");d.setFontSize(8.5);d.text(desc,78,y+5);
      d.text(String(q),365,y+5,{align:"right"});d.text(money(u,currency),442,y+5,{align:"right"});d.text(disc?`-${money(disc,currency)}`:"-",500,y+5,{align:"right"});d.setFont("helvetica","bold");d.text(money(line,currency),556,y+5,{align:"right"});
      d.setDrawColor(233,238,244);d.line(46,y+rowH-7,566,y+rowH-7);y+=rowH;
    });

    // Totals block. Move to a new page if it would crowd the footer.
    const need=Number(record.tax_total||0)?155:140;if(y+need>700){d.addPage();page++;y=addInvoicePage(d,record,logo,brand,page)}
    y+=14;const labelX=420,valueX=556;
    const totalRow=(label,value,bold=false)=>{d.setFont("helvetica",bold?"bold":"normal");d.setFontSize(bold?10.5:8.5);d.setTextColor(...(bold?brand:muted));d.text(label,labelX,y,{align:"right"});d.setTextColor(...(bold?brand:dark));d.text(value,valueX,y,{align:"right"});y+=17};
    totalRow("Subtotal",money(record.subtotal,currency));if(Number(record.discount_total||0))totalRow("Discount",`-${money(record.discount_total,currency)}`);if(Number(record.tax_total||0))totalRow("Tax",money(record.tax_total,currency));
    d.setDrawColor(...mix(brand,[255,255,255],.55));d.line(414,y-7,566,y-7);totalRow("Invoice Total",money(record.total,currency),true);totalRow("Payments",`-${money(record.amount_paid,currency)}`);
    d.setFillColor(...soft);d.roundedRect(406,y-7,160,34,6,6,"F");d.setFont("helvetica","bold");d.setFontSize(9);d.setTextColor(...brand);d.text("BALANCE DUE",418,y+13);d.setFontSize(13);d.text(money(record.amount_due,currency),554,y+13,{align:"right"});y+=48;

    // Payment / terms section.
    const pay=checkoutUrl(record);if(pay&&Number(record.amount_due||0)>0&&!['paid','void','uncollectible'].includes(String(record.status))){
      d.setFillColor(...brand);d.roundedRect(46,y,520,50,7,7,"F");d.setTextColor(255,255,255);d.setFont("helvetica","bold");d.setFontSize(9);d.text("PAY THIS INVOICE SECURELY ONLINE",60,y+18);d.setFont("helvetica","normal");d.setFontSize(8);d.text("Stripe payment is embedded next to your invoice on the screenings4u billing portal.",60,y+34);d.setFont("helvetica","bold");d.textWithLink("OPEN SECURE PAYMENT",552,y+29,{url:pay,align:"right"});y+=66;
    }else if(String(record.status)==="paid"||Number(record.amount_due||0)<=0){
      d.setFillColor(235,248,241);d.roundedRect(46,y,520,40,7,7,"F");d.setTextColor(25,119,77);d.setFont("helvetica","bold");d.setFontSize(10);d.text("PAID IN FULL",60,y+25);y+=54;
    }
    const tail=[];if(record.terms)tail.push(["PAYMENT TERMS",record.terms]);if(record.notes)tail.push(["NOTES",record.notes]);
    for(const [head,body] of tail){const lines=d.splitTextToSize(String(body),510);const h=26+lines.length*10;if(y+h>715){d.addPage();page++;y=addInvoicePage(d,record,logo,brand,page)}d.setTextColor(...brand);d.setFont("helvetica","bold");d.setFontSize(8);d.text(head,46,y);y+=13;d.setTextColor(...muted);d.setFont("helvetica","normal");d.setFontSize(8);d.text(lines,46,y);y+=lines.length*10+14}

    const pages=d.getNumberOfPages();for(let i=1;i<=pages;i++){d.setPage(i);addInvoiceFooter(d,record,i,pages,brand)}
    d.setProperties({title:`Invoice ${record.invoice_number||""}`,subject:`Itemized invoice from ${issuerName(record)}`,author:issuerName(record),creator:"screenings4u Enterprise"});
    return d;
  }

  async function legacyPdf(record,type){
    if(!window.jspdf?.jsPDF)throw Error("PDF library not loaded.");
    const {jsPDF}=window.jspdf,d=new jsPDF({unit:"pt",format:"letter"}),logo=await logoData(record),brand=rgb(brandColor(record)),issuer=issuerName(record);let y=48;
    if(logo){try{d.addImage(logo,undefined,48,35,170,56)}catch(_){}}else{d.setTextColor(...brand);d.setFontSize(17);d.text(issuer,48,58)}
    d.setTextColor(...brand);d.setFontSize(22);d.text(type.toUpperCase(),564,55,{align:"right"});d.setFontSize(10);d.text(record.invoice_number||record.proposal_number||"S4U",564,73,{align:"right"});
    d.setTextColor(40,50,65);y=112;d.setFontSize(8);d.text(`Issued by: ${issuer}`,48,y);y+=22;const name=record.customer_name||"Customer";d.setFontSize(11);d.text(`Prepared For: ${name}`,48,y);y+=16;d.setFontSize(9);if(record.customer_email)d.text(record.customer_email,48,y);y+=24;
    if(type==="invoice"){d.text(`Issue Date: ${record.issue_date||"-"}`,48,y);d.text(`Due Date: ${record.due_date||"-"}`,280,y);y+=28}else{d.text(`Valid Until: ${record.valid_until||"-"}`,48,y);y+=28}
    if(record.title){d.setFontSize(14);d.setTextColor(...brand);d.text(record.title,48,y);y+=22;d.setTextColor(40,50,65)}
    const sections=type==="proposal"?[["Executive Summary",record.executive_summary],["Client Needs",record.client_needs],["Proposed Solution",record.proposed_solution],["Scope of Work",record.scope_of_work],["Deliverables",record.deliverables],["Implementation Plan",record.implementation_plan],["Value Proposition",record.value_proposition],["Qualifications",record.qualifications]]:type==="quote"?[["Introduction",record.introduction]]:[];
    for(const [h,v] of sections){if(!v)continue;if(y>690){d.addPage();y=48}d.setFontSize(11);d.setTextColor(...brand);d.text(h,48,y);y+=14;d.setFontSize(9);d.setTextColor(40,50,65);const lines=d.splitTextToSize(String(v),515);d.text(lines,48,y);y+=lines.length*11+14}
    if(y>620){d.addPage();y=48}d.setFillColor(245,247,250);d.rect(48,y,516,22,"F");d.setFontSize(8);d.setTextColor(...brand);d.text("DESCRIPTION",54,y+14);d.text("QTY",350,y+14);d.text("UNIT",405,y+14);d.text("TOTAL",510,y+14);y+=32;
    for(const x of record.items||[]){if(y>700){d.addPage();y=48}const q=Number(x.quantity||1),u=Number(x.unit_price||0),line=Number(x.line_total??q*u);d.setTextColor(40,50,65);d.text(String(x.description||"Service").slice(0,58),54,y);d.text(String(q),350,y);d.text(money(u),405,y);d.text(money(line),510,y);y+=17}
    y+=10;d.setFontSize(10);d.setTextColor(...brand);d.text(`Subtotal: ${money(record.subtotal)}`,564,y,{align:"right"});y+=15;if(Number(record.discount_total)){d.text(`Discount: -${money(record.discount_total)}`,564,y,{align:"right"});y+=15}if(Number(record.tax_total)){d.text(`Tax: ${money(record.tax_total)}`,564,y,{align:"right"});y+=15}d.setFontSize(14);d.text(`Total: ${money(record.total)}`,564,y,{align:"right"});y+=25;
    const tail=type==="proposal"?[["Timeline",record.timeline_summary],["Terms",record.terms],["Next Steps",record.next_steps]]:[["Terms",record.terms],["Notes",record.notes]];for(const [h,v] of tail){if(!v)continue;if(y>690){d.addPage();y=48}d.setFontSize(10);d.setTextColor(...brand);d.text(h,48,y);y+=13;d.setFontSize(8);d.setTextColor(40,50,65);const lines=d.splitTextToSize(String(v),515);d.text(lines,48,y);y+=lines.length*10+12}
    const pages=d.getNumberOfPages();for(let i=1;i<=pages;i++){d.setPage(i);d.setFontSize(7);d.setTextColor(120);d.text(`${issuer} | ${record.invoice_number||record.proposal_number||"S4U"} | Page ${i} of ${pages}`,306,770,{align:"center"})}return d;
  }

  async function pdf(record,type){return type==="invoice"?invoicePdf(record):legacyPdf(record,type)}
  async function store(db,record,type){const d=await pdf(record,type),uri=d.output("datauristring"),base64=uri.split(",")[1],tracking=record.invoice_number||record.proposal_number;const {data,error}=await db.functions.invoke("business-document-actions",{body:{action:"store",entity_type:type,entity_id:record.id,tracking_number:tracking,owner_user_id:record.customer_user_id||record.user_id||null,employer_id:record.employer_id||null,pdf_base64:base64}});if(error)throw error;if(data?.error)throw Error(data.error);return data}
  async function get(db,id,type){const {data,error}=await db.functions.invoke("business-document-actions",{body:{action:"get",entity_type:type,entity_id:id}});if(error)throw error;if(data?.error)throw Error(data.error);return data}
  async function download(db,record,type){let g=await get(db,record.id,type);if(!g.exists){await store(db,record,type);g=await get(db,record.id,type)}const a=document.createElement("a");a.href=g.url;a.download=`${record.invoice_number||record.proposal_number}-${type}.pdf`;a.target="_blank";document.body.appendChild(a);a.click();a.remove()}
  window.S4UDocuments={pdf,store,get,download};
})();
