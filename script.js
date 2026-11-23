const $=id=>document.getElementById(id);
let chapters=[],filter="Todos",current=0,installPrompt=null,fontSize=1.28;
const fontSaved=Number(localStorage.getItem("todaEscrituraFont"));
if(fontSaved>=0.95&&fontSaved<=2.1)fontSize=fontSaved;
document.documentElement.style.setProperty("--reading",fontSize+"rem");

async function init(){
 try{
  const r=await fetch("./dados/devocionais_toda_a_escritura.json");
  const data=await r.json();chapters=data.capitulos;
  renderList();
  if("serviceWorker" in navigator)navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
 }catch(e){$("chapterList").innerHTML='<p class="empty">Não foi possível carregar as reflexões. Verifique sua conexão e atualize a página.</p>'}
}
function renderList(){
 const q=$("search").value.trim().toLocaleLowerCase("pt-BR");
 const found=chapters.filter(c=>(filter==="Todos"||c.testamento===filter)&&(!q||(`${c.numero} ${c.titulo} ${c.referencia} ${c.testamento}`).toLocaleLowerCase("pt-BR").includes(q)));
 $("countLabel").textContent=`${found.length} ${found.length===1?"reflexão":"reflexões"}`;
 $("chapterList").innerHTML="";
 if(!found.length){$("chapterList").innerHTML='<p class="empty">Nenhuma reflexão encontrada. Tente outra palavra.</p>';return}
 const frag=document.createDocumentFragment();
 found.forEach(c=>{
  const b=document.createElement("button");b.className="chapter-card";b.type="button";
  b.innerHTML=`<span class="chapter-no">${c.numero}</span><span><strong></strong><small></small></span><span class="chapter-arrow">›</span>`;
  b.querySelector("strong").textContent=c.titulo;b.querySelector("small").textContent=c.referencia;
  b.addEventListener("click",()=>openChapter(c.numero));frag.appendChild(b);
 });
 $("chapterList").appendChild(frag);
}
function openChapter(num){
 current=num-1;const c=chapters[current];
 $("homeView").hidden=true;$("readerView").hidden=false;
 $("testamentLabel").textContent=c.testamento;$("numberLabel").textContent=`REFLEXÃO ${c.numero} DE 565`;
 $("chapterTitle").textContent=c.titulo;$("chapterReference").textContent=c.referencia;
 const content=$("chapterText");content.innerHTML="";
 (c.reflexao||[]).forEach(p=>{const el=document.createElement("p");el.textContent=p;content.appendChild(el)});
 $("prevBtn").disabled=current===0;$("nextBtn").disabled=current===chapters.length-1;
 window.scrollTo({top:0,behavior:"smooth"});
}
function back(){ $("readerView").hidden=true;$("homeView").hidden=false;renderList();window.scrollTo({top:0,behavior:"smooth"})}
function changeFont(delta){fontSize=Math.max(.95,Math.min(2.1,Math.round((fontSize+delta)*100)/100));document.documentElement.style.setProperty("--reading",fontSize+"rem");localStorage.setItem("todaEscrituraFont",fontSize)}
$("search").addEventListener("input",renderList);
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderList()}));
$("backBtn").addEventListener("click",back);
$("fontDown").addEventListener("click",()=>changeFont(-.1));$("fontUp").addEventListener("click",()=>changeFont(.1));
$("prevBtn").addEventListener("click",()=>{if(current>0)openChapter(current)});
$("nextBtn").addEventListener("click",()=>{if(current<chapters.length-1)openChapter(current+2)});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true});
init();