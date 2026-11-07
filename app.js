// Configure as instruções do README antes de publicar.
const SUPABASE_URL = "https://nnqhzpmrpxgfhjiyrjsw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZWlaI4NNO5vxAdTctRiyuQ_7nbZvF52";
const configured = !SUPABASE_URL.startsWith("COLE_") && !SUPABASE_ANON_KEY.startsWith("COLE_");
const client = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
const brl = n => Number(n || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let clients = [], quotes = [], transactions = [];

function showMessage(message, error=false){ $("loginMessage").textContent=message; $("loginMessage").style.color=error?"#b42318":"#087a4b"; }
function quoteTotal(){return Math.max(0,Number($("quantity").value||0)*Number($("serviceValue").value||0)+Number($("materials").value||0)+Number($("travel").value||0)-Number($("discount").value||0));}
["quantity","serviceValue","materials","travel","discount"].forEach(id=>$(id).addEventListener("input",()=>{$("quoteTotal").textContent=brl(quoteTotal())}));
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function refresh(){
  const [c,q,t]=await Promise.all([
    client.from("clients").select("*").order("created_at",{ascending:false}),
    client.from("quotes").select("*, clients(name,phone,address)").order("created_at",{ascending:false}),
    client.from("transactions").select("*").order("date",{ascending:false})
  ]);
  for(const r of [c,q,t]) if(r.error) throw r.error;
  clients=c.data||[]; quotes=q.data||[]; transactions=t.data||[];
  render();
}
function render(){
  $("statQuotes").textContent=quotes.length;$("statClients").textContent=clients.length;
  $("statIncome").textContent=brl(transactions.filter(x=>x.type==="income").reduce((s,x)=>s+Number(x.amount),0));
  $("statExpense").textContent=brl(transactions.filter(x=>x.type==="expense").reduce((s,x)=>s+Number(x.amount),0));
  $("quoteClient").innerHTML='<option value="">Selecione um cliente</option>'+clients.map(c=>`<option value="${c.id}">${safe(c.name)}</option>`).join("");
  $("clientsList").innerHTML=clients.length?`<table><thead><tr><th>Nome</th><th>Telefone</th><th>Endereço</th><th></th></tr></thead><tbody>${clients.map(c=>`<tr><td>${safe(c.name)}</td><td>${safe(c.phone)}</td><td>${safe(c.address)}</td><td><button class="action danger" onclick="deleteRecord('clients','${c.id}')">Excluir</button></td></tr>`).join("")}</tbody></table>`:"Nenhum cliente cadastrado.";
  $("quotesList").innerHTML=quotes.length?`<table><thead><tr><th>Data</th><th>Cliente</th><th>Serviço</th><th>Total</th><th>Ações</th></tr></thead><tbody>${quotes.map(q=>`<tr><td>${new Date(q.created_at).toLocaleDateString("pt-BR")}</td><td>${safe(q.clients?.name)}</td><td>${safe(q.service)} • ${safe(q.capacity)}</td><td><strong>${brl(q.total)}</strong></td><td><button class="action" onclick="printQuote('${q.id}')">PDF / Imprimir</button><button class="action" onclick="sendWhatsApp('${q.id}')">WhatsApp</button><button class="action danger" onclick="deleteRecord('quotes','${q.id}')">Excluir</button></td></tr>`).join("")}</tbody></table>`:"Nenhum orçamento cadastrado.";
  $("financeList").innerHTML=transactions.length?`<table><thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th><th></th></tr></thead><tbody>${transactions.map(t=>`<tr><td>${new Date(t.date+"T12:00:00").toLocaleDateString("pt-BR")}</td><td>${safe(t.description)}</td><td>${t.type==="income"?"Receita":"Despesa"}</td><td><strong>${brl(t.amount)}</strong></td><td><button class="action danger" onclick="deleteRecord('transactions','${t.id}')">Excluir</button></td></tr>`).join("")}</tbody></table>`:"Nenhuma movimentação registrada.";
}
async function deleteRecord(table,id){if(!confirm("Deseja excluir este registro?"))return;const {error}=await client.from(table).delete().eq("id",id);if(error)alert(error.message);else await refresh();}
function getQuote(id){return quotes.find(q=>q.id===id)}
function quoteText(q){const c=q.clients||{};return `REGRIGERAR INSTALAÇÃO E MANUTENÇÃO DE AR CONDICIONADO\nORÇAMENTO\nCliente: ${c.name||""}\nTelefone: ${c.phone||""}\nEndereço: ${c.address||""}\nEquipamento: ${q.equipment} ${q.capacity||""}\nServiço: ${q.service}\nQuantidade: ${q.quantity}\nServiços: ${brl(q.service_value)}\nMateriais: ${brl(q.materials)}\nDeslocamento: ${brl(q.travel)}\nDesconto: ${brl(q.discount)}\nTOTAL: ${brl(q.total)}\nValidade: ${q.validity} dias\nObservações: ${q.notes||""}\nServiço realizado por profissional especializado.\nAgradecemos pela preferência!`;}
function printQuote(id){const q=getQuote(id);if(!q)return;const w=window.open("","_blank");w.document.write(`<html><head><title>Orçamento REGRIGERAR</title><style>body{font:15px Arial;color:#17365f;padding:35px}img{width:320px;max-width:100%}h1{color:#073b82}hr{border:0;border-top:2px solid #087bd7}pre{white-space:pre-wrap;font:15px Arial;line-height:1.7}</style></head><body><img src="assets/logo-refrigerar.jpg"><hr><h1>Orçamento</h1><pre>${safe(quoteText(q))}</pre></body></html>`);w.document.close();w.focus();w.print();}
function sendWhatsApp(id){const q=getQuote(id);if(!q)return;const phone=(q.clients?.phone||"").replace(/\D/g,"");if(!phone){alert("Cadastre o telefone/WhatsApp do cliente.");return;}const full=phone.startsWith("55")?phone:"55"+phone;window.open("https://wa.me/"+full+"?text="+encodeURIComponent(quoteText(q)),"_blank");}
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!configured){showMessage("O sistema ainda precisa ser conectado ao Supabase. Siga o README do projeto.",true);return;}showMessage("Entrando...");const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){showMessage(error.message,true);return;}await enterApp();});
async function enterApp(){$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");try{await refresh();}catch(e){alert("Erro ao carregar dados: "+e.message);}}
$("logoutBtn").addEventListener("click",async()=>{await client.auth.signOut();$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");});
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(b.dataset.page+"Page").classList.remove("hidden");$("pageTitle").textContent=b.textContent;}));
$("clientForm").addEventListener("submit",async e=>{e.preventDefault();const {error}=await client.from("clients").insert({name:$("clientName").value,phone:$("clientPhone").value,address:$("clientAddress").value,notes:$("clientNotes").value});if(error)alert(error.message);else{e.target.reset();await refresh();}});
$("quoteForm").addEventListener("submit",async e=>{e.preventDefault();const total=quoteTotal();const payload={client_id:$("quoteClient").value,equipment:$("equipment").value,capacity:$("capacity").value,service:$("service").value,quantity:Number($("quantity").value),service_value:Number($("serviceValue").value),materials:Number($("materials").value),travel:Number($("travel").value),discount:Number($("discount").value),total,validity:Number($("validity").value),notes:$("quoteNotes").value};const {error}=await client.from("quotes").insert(payload);if(error)alert(error.message);else{e.target.reset();$("quantity").value=1;$("service").value="Instalação";$("equipment").value="Ar-condicionado Split";$("validity").value=7;$("quoteTotal").textContent=brl(0);await refresh();}});
$("financeForm").addEventListener("submit",async e=>{e.preventDefault();const {error}=await client.from("transactions").insert({description:$("finDescription").value,type:$("finType").value,amount:Number($("finAmount").value),date:$("finDate").value});if(error)alert(error.message);else{e.target.reset();$("finDate").value=new Date().toISOString().slice(0,10);await refresh();}});
$("finDate").value=new Date().toISOString().slice(0,10);
if(configured){client.auth.getSession().then(({data})=>{if(data.session)enterApp();});}
