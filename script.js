const KEY="expense-tracker-transactions";
const form=document.getElementById("transactionForm"), dateInput=document.getElementById("date"), list=document.getElementById("transactionList"), listEmpty=document.getElementById("listEmpty"), filterType=document.getElementById("filterType"), searchInput=document.getElementById("searchInput");
let transactions=load(); dateInput.value=new Date().toISOString().slice(0,10);
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(transactions))}
function money(v){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(v)}
function esc(v){const d=document.createElement("div");d.textContent=v;return d.innerHTML}
function render(){
 const income=transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
 const expense=transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
 document.getElementById("income").textContent=money(income);document.getElementById("expense").textContent=money(expense);document.getElementById("balance").textContent=money(income-expense);
 const q=searchInput.value.trim().toLowerCase(), f=filterType.value;
 const shown=transactions.filter(t=>(f==="all"||t.type===f)&&(!q||t.description.toLowerCase().includes(q)||t.category.toLowerCase().includes(q)));
 list.innerHTML="";listEmpty.style.display=shown.length?"none":"block";
 shown.forEach(t=>{const row=document.createElement("div");row.className="transaction";const sign=t.type==="income"?"+":"-",icon=t.type==="income"?"↗":"↘";row.innerHTML='<div class="icon '+t.type+'">'+icon+'</div><div><div class="transaction-title">'+esc(t.description)+'</div><div class="transaction-meta">'+esc(t.category)+" · "+new Date(t.date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})+'</div></div><div class="transaction-amount '+t.type+'">'+sign+money(t.amount)+'</div><button class="delete-btn" title="Delete">×</button>';row.querySelector(".delete-btn").onclick=()=>{transactions=transactions.filter(x=>x.id!==t.id);save();render()};list.appendChild(row)});
 const totals={};transactions.filter(t=>t.type==="expense").forEach(t=>totals[t.category]=(totals[t.category]||0)+t.amount);const entries=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,7),chart=document.getElementById("chart"),empty=document.getElementById("chartEmpty");chart.innerHTML="";
 if(!entries.length){chart.style.display="none";empty.style.display="block"}else{chart.style.display="flex";empty.style.display="none";const max=entries[0][1];entries.forEach(([cat,total])=>{const w=document.createElement("div");w.className="bar-wrap";w.innerHTML='<div class="bar-value">'+money(total)+'</div><div class="bar" style="height:'+Math.max(5,total/max*145)+'px"></div><div class="bar-label">'+esc(cat)+'</div>';chart.appendChild(w)})}
}
form.onsubmit=e=>{e.preventDefault();const d=new FormData(form),amount=Number(d.get("amount"));if(!amount||amount<=0)return;transactions.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),description:d.get("description").trim(),amount,type:d.get("type"),category:d.get("category"),date:d.get("date")});save();form.reset();dateInput.value=new Date().toISOString().slice(0,10);render()};
filterType.onchange=render;searchInput.oninput=render;
document.getElementById("clearAllBtn").onclick=()=>{if(transactions.length&&confirm("Delete all transactions?")){transactions=[];save();render()}};
render();