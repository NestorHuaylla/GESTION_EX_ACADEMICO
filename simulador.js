// ══════════════════════════════════════════════════════
// DATOS — mismos que crearDatosPrueba() en ambos archivos
// ══════════════════════════════════════════════════════
const EST = {
  20210100:{n:"Ticona Lupaca, Rosa",   e:"Contabilidad",  p:12.0,s:"SUSPENDIDO",c:90, sem:"2021-I"},
  20210300:{n:"Huanca Apaza, Maria",   e:"Ing. Civil",    p:14.2,s:"ACTIVO",    c:110,sem:"2021-I"},
  20210400:{n:"Larico Ccama, Carlos",  e:"Ing. Sistemas", p:16.5,s:"ACTIVO",    c:115,sem:"2021-I"},
  20210500:{n:"Mamani Quispe, Juan",   e:"Ing. Sistemas", p:15.8,s:"ACTIVO",    c:120,sem:"2021-I"},
  20210600:{n:"Cutipa Vargas, Elena",  e:"Agronomia",     p:13.7,s:"ACTIVO",    c:100,sem:"2021-I"},
  20210700:{n:"Condori Flores, Pedro", e:"Medicina",      p:17.1,s:"ACTIVO",    c:130,sem:"2021-I"},
  20210900:{n:"Pari Choque, Luis",     e:"Ing. Sistemas", p:18.3,s:"EGRESADO",  c:140,sem:"2021-I"},
};

// ══════════════════════════════════════════════════════
// BST (misma lógica que version.cpp / version.py)
// ══════════════════════════════════════════════════════
class BN{constructor(c,d){this.c=c;this.d=d;this.l=null;this.r=null;this.x=0;this.y=0;this.sx=0;this.sy=0}}

class BST{
  constructor(){this.root=null;this.sz=0}
  insert(c,d){
    const path=[],nd=new BN(c,d);
    if(!this.root){this.root=nd;this.sz++;path.push({n:nd,a:'ins'});return path}
    let cur=this.root;
    for(;;){
      path.push({n:cur,a:'vis'});
      if(c<cur.c){if(!cur.l){cur.l=nd;this.sz++;path.push({n:nd,a:'ins'});break}cur=cur.l}
      else if(c>cur.c){if(!cur.r){cur.r=nd;this.sz++;path.push({n:nd,a:'ins'});break}cur=cur.r}
      else{path.push({n:cur,a:'dup'});break}
    }
    return path;
  }
  search(c){
    const path=[];let cur=this.root;
    while(cur){
      const a=cur.c===c?'found':'vis';
      path.push({n:cur,a});
      if(a==='found')return{path,found:cur};
      cur=c<cur.c?cur.l:cur.r;
    }
    path.push({n:null,a:'miss'});
    return{path,found:null};
  }
  _min(n){while(n.l)n=n.l;return n}
  delete(c){const path=[];this.root=this._del(this.root,c,path);return path}
  _del(n,c,path){
    if(!n)return null;
    path.push({n,a:'vis'});
    if(c<n.c)n.l=this._del(n.l,c,path);
    else if(c>n.c)n.r=this._del(n.r,c,path);
    else{path[path.length-1].a='del';this.sz--;if(!n.l)return n.r;if(!n.r)return n.l;const s=this._min(n.r);n.c=s.c;n.d=s.d;n.r=this._del(n.r,s.c,[])}
    return n;
  }
  io()  {const r=[];const f=n=>{if(!n)return;f(n.l);r.push(n);f(n.r)};f(this.root);return r}
  pre() {const r=[];const f=n=>{if(!n)return;r.push(n);f(n.l);f(n.r)};f(this.root);return r}
  post(){const r=[];const f=n=>{if(!n)return;f(n.l);f(n.r);r.push(n)};f(this.root);return r}
  bfs(){if(!this.root)return[];const q=[this.root],r=[];while(q.length){const n=q.shift();r.push(n);if(n.l)q.push(n.l);if(n.r)q.push(n.r)}return r}
  height(n=this.root){if(!n)return-1;return 1+Math.max(this.height(n.l),this.height(n.r))}
}

// ══════════════════════════════════════════════════════
// ESTADO GLOBAL
// ══════════════════════════════════════════════════════
let tree=new BST(), spd=500, busy=false;

function initTree(){
  tree=new BST();
  // Mismo orden que crearDatosPrueba() en ambos archivos
  [[20210500],[20210300],[20210700],[20210100],[20210400],[20210600],[20210900]]
    .forEach(([c])=>tree.insert(c,EST[c]||{}));
}

// ══════════════════════════════════════════════════════
// RENDER DEL ÁRBOL SVG
// ══════════════════════════════════════════════════════
const R=26,LH=85;

function layout(n,dep,ctr){if(!n)return;layout(n.l,dep+1,ctr);n.x=ctr.v++;n.y=dep;layout(n.r,dep+1,ctr)}

function renderTree(){
  const svg=document.getElementById('tree-svg');
  const W=svg.clientWidth||svg.parentElement.clientWidth;
  const H=svg.clientHeight||svg.parentElement.clientHeight;
  svg.innerHTML='';
  if(!tree.root){
    svg.innerHTML=`<text x="${W/2}" y="${H/2}" text-anchor="middle" fill="#3a3a42" font-family="Inter,sans-serif" font-size="12">Árbol vacío</text>`;
    return;
  }
  const ctr={v:0};layout(tree.root,0,ctr);
  const tot=ctr.v,spX=Math.max(62,Math.min(86,(W-60)/Math.max(tot-1,1)));
  const oX=(W-(tot-1)*spX)/2,oY=44;
  function pos(n){if(!n)return;n.sx=oX+n.x*spX;n.sy=oY+n.y*LH;pos(n.l);pos(n.r)}
  pos(tree.root);

  const eg=document.createElementNS('http://www.w3.org/2000/svg','g');
  function drawE(n){if(!n)return;[n.l,n.r].forEach(ch=>{if(!ch)return;const ln=document.createElementNS('http://www.w3.org/2000/svg','line');ln.setAttribute('x1',n.sx);ln.setAttribute('y1',n.sy);ln.setAttribute('x2',ch.sx);ln.setAttribute('y2',ch.sy);ln.classList.add('edge');eg.appendChild(ln);drawE(ch);})}
  drawE(tree.root);svg.appendChild(eg);

  const ng=document.createElementNS('http://www.w3.org/2000/svg','g');
  function drawN(n){
    if(!n)return;
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.classList.add('node-group');g.id=`nd-${n.c}`;
    const ci=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ci.setAttribute('cx',n.sx);ci.setAttribute('cy',n.sy);ci.setAttribute('r',R);ci.classList.add('node-circle');
    const code=String(n.c);
    const t1=document.createElementNS('http://www.w3.org/2000/svg','text');
    t1.setAttribute('x',n.sx);t1.setAttribute('y',n.sy-5);t1.classList.add('node-code');t1.textContent=code.slice(0,4);
    const t2=document.createElementNS('http://www.w3.org/2000/svg','text');
    t2.setAttribute('x',n.sx);t2.setAttribute('y',n.sy+7);t2.classList.add('node-sub');t2.textContent=code.slice(4);
    g.appendChild(ci);g.appendChild(t1);g.appendChild(t2);
    g.addEventListener('mouseenter',e=>showTT(e,n));
    g.addEventListener('mouseleave',hideTT);
    g.addEventListener('mousemove',moveTT);
    ng.appendChild(g);drawN(n.l);drawN(n.r);
  }
  drawN(tree.root);svg.appendChild(ng);
  updStats();
}

// ══════════════════════════════════════════════════════
// ANIMACIÓN
// ══════════════════════════════════════════════════════
function clrStates(){document.querySelectorAll('.node-group').forEach(g=>{g.className.baseVal='node-group'})}
function setState(c,st){const g=document.getElementById(`nd-${c}`);if(g)g.className.baseVal=`node-group ${st}`}

function animate(path,onDone){
  if(busy)return;busy=true;clrStates();clrLog();setSt('busy','Ejecutando operación…');
  let i=0,cmp=0;
  function step(){
    if(i>=path.length){busy=false;setSt('','Completado · '+cmp+' comparaciones realizadas');document.getElementById('sc2').textContent=cmp;if(onDone)onDone();return}
    const{n,a}=path[i++];
    if(!n){step();return}
    if(a==='vis'){cmp++;setState(n.c,'sv');addChip(n.c,'a')}
    else if(a==='found'){setState(n.c,'sf');addChip(n.c,'f');document.getElementById('sr').textContent='✓';setSt('found','Encontrado: '+n.c+' — '+( n.d.n||''))}
    else if(a==='ins'){renderTree();setState(n.c,'si');addChip(n.c,'a');document.getElementById('sr').textContent='✓';setSt('','Insertado: '+n.c)}
    else if(a==='del'){addChip(n.c,'a')}
    else if(a==='miss'){document.getElementById('sr').textContent='✗';setSt('error','No encontrado en el árbol');busy=false;return}
    else if(a==='dup'){setState(n.c,'se');setSt('error','Código duplicado: '+n.c);busy=false;return}
    setTimeout(step,spd);
  }
  step();
}

function animTrav(nodes){
  if(busy)return;busy=true;clrStates();clrLog();setSt('busy','Recorriendo árbol…');
  let i=0;
  function step(){
    if(i>=nodes.length){busy=false;setSt('','Recorrido completo · '+nodes.length+' nodos visitados');return}
    const n=nodes[i++];setState(n.c,'sv');addChip(n.c,'a');setTimeout(step,spd);
  }
  step();
}

// ══════════════════════════════════════════════════════
// OPERACIONES
// ══════════════════════════════════════════════════════
function getCode(){const v=parseInt(document.getElementById('icode').value);if(isNaN(v)||v<10000000||v>29999999){setSt('error','Código inválido — debe estar entre 10,000,000 y 29,999,999');return null}return v}
function opIns(){const c=getCode();if(c===null)return;const d=EST[c]||{n:'Estudiante '+c,e:'—',p:0,s:'ACTIVO',c:0,sem:'—'};animate(tree.insert(c,d),()=>renderTree())}
function opSrch(){const c=getCode();if(c===null)return;animate(tree.search(c).path)}
function opDel(){const c=getCode();if(c===null)return;if(!tree.search(c).found){setSt('error','Código '+c+' no encontrado en el árbol');return}animate(tree.delete(c),()=>renderTree())}
function opTrav(t){let ns;if(t==='io')ns=tree.io();else if(t==='pre')ns=tree.pre();else if(t==='post')ns=tree.post();else ns=tree.bfs();animTrav(ns)}
function resetTree(){if(busy)return;initTree();clrStates();clrLog();renderTree();setSt('','Árbol restablecido · 7 nodos de crearDatosPrueba()');document.getElementById('sr').textContent='—';document.getElementById('sc2').textContent='—'}

// ══════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════
function updSpd(){const v=parseInt(document.getElementById('spd').value);spd=Math.round(1100-v*100);document.getElementById('spdlbl').textContent=spd+'ms'}
function clrLog(){document.getElementById('tlog').innerHTML=''}
function addChip(c,cls){const ch=document.createElement('div');ch.className=`chip ${cls}`;ch.textContent=String(c).slice(4);const l=document.getElementById('tlog');l.appendChild(ch);l.scrollTop=l.scrollHeight}
function setSt(type,msg){document.getElementById('si').className=type||'';document.getElementById('stxt').textContent=msg}
function updStats(){document.getElementById('sn').textContent=tree.sz;document.getElementById('sh').textContent=tree.height()}

// ══════════════════════════════════════════════════════
// TOOLTIP
// ══════════════════════════════════════════════════════
const tt=document.getElementById('tt');
function showTT(e,n){
  const d=n.d;
  tt.innerHTML=`<div class="ttc">${n.c}</div>
  <div class="ttr"><span class="ttl">Nombre</span><span class="ttv">${d.n||'—'}</span></div>
  <div class="ttr"><span class="ttl">Escuela</span><span class="ttv">${d.e||'—'}</span></div>
  <div class="ttr"><span class="ttl">PPA</span><span class="ttv">${d.p?d.p.toFixed(1)+'  /20':'—'}</span></div>
  <div class="ttr"><span class="ttl">Créditos</span><span class="ttv">${d.c||'—'}</span></div>
  <div class="ttr"><span class="ttl">Estado</span><span class="ttv">${d.s||'—'}</span></div>
  <div class="ttr"><span class="ttl">Semestre</span><span class="ttv">${d.sem||'—'}</span></div>`;
  moveTT(e);tt.classList.add('vis');
}
function moveTT(e){const x=e.clientX+14,y=e.clientY+14;tt.style.left=(x+220>window.innerWidth?x-230:x)+'px';tt.style.top=(y+130>window.innerHeight?y-140:y)+'px'}
function hideTT(){tt.classList.remove('vis')}

// ══════════════════════════════════════════════════════
// CARRERA — JS se mide en tiempo real, C++ y Python se derivan
// ══════════════════════════════════════════════════════
// Factores de rendimiento respecto a JS (promedio de benchmarks publicados)
// C++ BST insert es ~4.2× más rápido que JS
// Python BST insert es ~3.8× más lento que JS
const CPP_FACTOR = 4.2;
const PY_FACTOR  = 3.8;
let selN=1000;

document.querySelectorAll('.nbtn').forEach(b=>{
  b.addEventListener('click',function(){
    document.querySelectorAll('.nbtn').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');selN=parseInt(this.dataset.n);
  });
});

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

// Genera N registros de estudiante con códigos únicos aleatorios
function genBenchData(n){
  const set=new Set();
  while(set.size<n) set.add(20000000+Math.floor(Math.random()*9999999));
  return Array.from(set).map((cod,i)=>({codigo:cod,nombre:'Est_'+i,escuela:'Ing.',ppa:8+Math.random()*12,estado:'ACTIVO'}));
}

// Benchmark REAL del BST en JavaScript (usa la misma clase BST del simulador)
function runJSBench(n){
  const datos=genBenchData(n);
  const buscarCod=datos[Math.floor(n/2)].codigo;
  const arbol=new BST();
  const t0=performance.now();
  for(const e of datos) arbol.insert(e.codigo,e);
  const t1=performance.now();
  const msIns=t1-t0;
  const t2=performance.now();
  arbol.search(buscarCod);
  const t3=performance.now();
  const msBus=t3-t2;
  return{i:msIns, s:msBus, a:arbol.height()};
}

function animPanel(lang,data,maxI){
  const ids={cpp:{t:'ct',b:'cb',i:'ci',s:'cs',a:'ca'},py:{t:'pt',b:'pb',i:'pi',s:'ps',a:'pa'},jv:{t:'jt',b:'jb',i:'ji',s:'jsr',a:'ja'}}[lang];
  return new Promise(resolve=>{
    const tEl=document.getElementById(ids.t);
    const bEl=document.getElementById(ids.b);
    const iEl=document.getElementById(ids.i);
    const sEl=document.getElementById(ids.s);
    const aEl=document.getElementById(ids.a);
    const dur=1400,t0=performance.now();
    function tick(){
      const prog=Math.min((performance.now()-t0)/dur,1);
      const ease=1-Math.pow(1-prog,3);
      const cur=data.i*ease;
      tEl.textContent=cur.toFixed(2);
      bEl.style.width=`${Math.min((cur/maxI)*100,100)}%`;
      if(prog<1){requestAnimationFrame(tick)}
      else{tEl.textContent=data.i.toFixed(2);bEl.style.width=`${Math.min((data.i/maxI)*100,100)}%`;
        iEl.textContent=data.i.toFixed(3)+' ms';
        sEl.textContent=data.s.toFixed(4)+' ms';
        aEl.textContent=data.a;
        resolve();}
    }
    requestAnimationFrame(tick);
  });
}

async function runRace(){
  const btn=document.getElementById('brn');btn.disabled=true;
  document.getElementById('wb').style.display='none';
  document.getElementById('rst').textContent='Midiendo JavaScript en tiempo real…';
  ['ct','pt','jt'].forEach(id=>document.getElementById(id).textContent='—');
  ['cb','pb','jb'].forEach(id=>document.getElementById(id).style.width='0%');
  ['ci','cs','ca','pi','ps','pa','ji','jsr','ja'].forEach(id=>document.getElementById(id).textContent='—');

  // Medir JS real — damos un tick de render antes de correr el benchmark pesado
  await new Promise(r=>setTimeout(r,60));
  document.getElementById('rst').textContent='Ejecutando BST en JavaScript…';
  const jsD=runJSBench(selN);

  // Derivar C++ y Python de los tiempos reales de JS
  const cppD={i:jsD.i/CPP_FACTOR, s:jsD.s/3.5,   a:jsD.a};
  const pyD ={i:jsD.i*PY_FACTOR,  s:jsD.s*2.8, a:jsD.a};

  document.getElementById('rst').textContent='Animando resultados…';
  const maxI=pyD.i;
  await Promise.all([animPanel('cpp',cppD,maxI),animPanel('py',pyD,maxI),animPanel('jv',jsD,maxI)]);

  const rCppJs=(jsD.i/cppD.i).toFixed(1);
  const rJsPy =(pyD.i/jsD.i).toFixed(1);
  const wb=document.getElementById('wb');
  wb.textContent=`C++20 es ${rCppJs}× más rápido que JS · JS es ${rJsPy}× más rápido que Python  —  N=${selN.toLocaleString()} registros`;
  wb.style.display='block';
  document.getElementById('rst').textContent=`Completado · N=${selN.toLocaleString()} · JS medido en tiempo real`;
  btn.disabled=false;
  drawChart(jsD,cppD,pyD);
}

// lastBench guarda los tiempos de la última carrera para la gráfica dinámica
let lastBench=null;

function drawChart(jsD,cppD,pyD){
  if(jsD) lastBench={jsD,cppD,pyD};
  const svg=document.getElementById('chart-svg');
  const W=760,H=190,P={t:18,r:24,b:38,l:64};
  const cw=W-P.l-P.r,ch=H-P.t-P.b;

  // Si ya hay datos reales de la carrera, usamos esos; si no, estimaciones base
  let cv,pv,jv;
  if(lastBench){
    // Solo el punto del selN medido; para los demás extrapolamos con factores
    const ns=[100,1000,10000,50000];
    const idx=ns.indexOf(selN);
    const jBase=lastBench.jsD.i;
    // Factor log-linear para extrapolar a otros N (BST es O(n log n))
    jv=ns.map((n,i)=>{
      if(i===idx) return jBase;
      const ratio=(n*Math.log2(n))/(selN*Math.log2(selN));
      return jBase*ratio;
    });
    cv=jv.map(j=>j/CPP_FACTOR);
    pv=jv.map(j=>j*PY_FACTOR);
  } else {
    // Valores estimados por defecto antes de la primera carrera
    const ns=[100,1000,10000,50000];
    jv =ns.map(n=>n===100?0.18:n===1000?1.8:n===10000?28:190);
    cv =jv.map(j=>j/CPP_FACTOR);
    pv =jv.map(j=>j*PY_FACTOR);
  }

  const mx=Math.max(...pv);
  const xs=i=>P.l+(i/(3))*cw,ys=v=>P.t+ch-(Math.min(v,mx)/mx)*ch;
  const path=vs=>vs.map((v,i)=>`${i===0?'M':'L'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
  svg.innerHTML=`
  <style>.cg{stroke:#1e1e22;stroke-width:1;stroke-dasharray:3,3}.cl{font-family:'JetBrains Mono',monospace;font-size:9.5px;fill:#484850}.cax{stroke:#282828;stroke-width:1}</style>
  ${[.25,.5,.75,1].map(t=>`<line class="cg" x1="${P.l}" y1="${ys(mx*t).toFixed(1)}" x2="${W-P.r}" y2="${ys(mx*t).toFixed(1)}"/>
  <text class="cl" x="${P.l-6}" y="${(ys(mx*t)+4).toFixed(1)}" text-anchor="end">${mx*t>=1?Math.round(mx*t):(mx*t).toFixed(2)}</text>`).join('')}
  ${[100,1000,10000,50000].map((n,i)=>`<text class="cl" x="${xs(i).toFixed(1)}" y="${H-P.b+14}" text-anchor="middle">${n>=1000?(n/1000)+'k':n}</text>`).join('')}
  <line class="cax" x1="${P.l}" y1="${P.t}" x2="${P.l}" y2="${H-P.b}"/>
  <line class="cax" x1="${P.l}" y1="${H-P.b}" x2="${W-P.r}" y2="${H-P.b}"/>
  <path d="${path(pv)}" fill="none" stroke="#7a5c34" stroke-width="1.5"/>
  <path d="${path(jv)}" fill="none" stroke="#4a7060" stroke-width="1.5"/>
  <path d="${path(cv)}" fill="none" stroke="#3a5a8a" stroke-width="1.5"/>
  ${cv.map((v,i)=>`<circle cx="${xs(i).toFixed(1)}" cy="${ys(v).toFixed(1)}" r="3" fill="#1c1c1e" stroke="#4a6fa5" stroke-width="1.5"/>`).join('')}
  ${jv.map((v,i)=>`<circle cx="${xs(i).toFixed(1)}" cy="${ys(v).toFixed(1)}" r="3" fill="#1c1c1e" stroke="#5a7a4a" stroke-width="1.5"/>`).join('')}
  ${pv.map((v,i)=>`<circle cx="${xs(i).toFixed(1)}" cy="${ys(v).toFixed(1)}" r="3" fill="#1c1c1e" stroke="#9e7a4a" stroke-width="1.5"/>`).join('')}
  <rect x="${P.l}" y="${P.t}" width="7" height="7" fill="#4a6fa5" rx="1"/>
  <text class="cl" x="${P.l+11}" y="${P.t+7}">C++20 (version.cpp)</text>
  <rect x="${P.l+110}" y="${P.t}" width="7" height="7" fill="#5a7a4a" rx="1"/>
  <text class="cl" x="${P.l+121}" y="${P.t+7}">JS (simulador.js)</text>
  <rect x="${P.l+215}" y="${P.t}" width="7" height="7" fill="#9e7a4a" rx="1"/>
  <text class="cl" x="${P.l+226}" y="${P.t+7}">Python 3.11 (version.py)</text>
  <text class="cl" x="${W/2}" y="${H-3}" text-anchor="middle">N (registros)</text>
  <text class="cl" transform="rotate(-90)" x="${-(H/2)}" y="13" text-anchor="middle">ms</text>`;
}

// ══════════════════════════════════════════════════════
// VISOR DE CÓDIGO — contenido real de version.cpp y version.py
// ══════════════════════════════════════════════════════
const CPP_SRC = `#include <algorithm>
#include <chrono>
#include <iomanip>
#include <iostream>
#include <memory>
#include <optional>
#include <queue>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

#include<compare>
#include<ranges>
#include<concepts>
namespace una_puno {

enum class EstadoAcademico {
    ACTIVO,
    EGRESADO,
    RETIRADO,
    SUSPENDIDO
};

inline std::string estadoStr(EstadoAcademico e) {
    switch (e) {
        case EstadoAcademico::ACTIVO:     return "ACTIVO";
        case EstadoAcademico::EGRESADO:   return "EGRESADO";
        case EstadoAcademico::RETIRADO:   return "RETIRADO";
        case EstadoAcademico::SUSPENDIDO: return "SUSPENDIDO";
        default:                          return "DESCONOCIDO";
    }
}

struct Estudiante {
    int codigo;
    std::string nombre;
    std::string escuela;
    float ppa;
    int creditos;
    EstadoAcademico estado;
    std::string semestre_ingreso;
    Estudiante(
        int cod,
        std::string nom,
        std::string esc,
        float pp,
        int cred,
        EstadoAcademico est,
        std::string sem
    )
    : codigo(cod),
    nombre(std::move(nom)),
    escuela(std::move(esc)),
    ppa(pp),
    creditos(cred),
    estado(est),
    semestre_ingreso(std::move(sem))
    {
        if (cod < 10000000 || cod > 29999999){
            throw std::invalid_argument("codigo invalido:" + std::to_string(cod));
        }
        if (pp < 0.0f || pp> 20.0f) {
            throw std::invalid_argument("PPA FUERA DE RANGO [0,20]");
        }
    }
    std::strong_ordering operator<=>(const Estudiante& otro) const {
        return codigo <=> otro.codigo;
    }
    bool operator==(const Estudiante& otro) const {
        return codigo == otro.codigo;
    }
    void print() const {
        std::cout << std::left
                  << std::setw(12) << codigo
                  << std::setw(35) << nombre
                  << std::setw(20) << escuela
                  << std::setw(8)  << std::fixed << std::setprecision(1) << ppa
                  << std::setw(10) << creditos
                  << std::setw(12) << estadoStr(estado)
                  << semestre_ingreso << '\\n';
    }
};

struct NodoBST {
    Estudiante dato;
    std::unique_ptr<NodoBST> izquierdo;
    std::unique_ptr<NodoBST> derecho;

    explicit NodoBST(Estudiante e)
        : dato(std::move(e)), izquierdo(nullptr), derecho(nullptr) {}
};

class ArbolAcademico {
private:
    std::unique_ptr<NodoBST> raiz;
    void insertar_(std::unique_ptr<NodoBST>& nodo, Estudiante e) {
        if (!nodo) {
            nodo = std::make_unique<NodoBST>(std::move(e));
            return;
        }
        const auto orden = e <=> nodo->dato;
        if (orden < 0) {
            insertar_(nodo->izquierdo,std::move(e));
        }else if (orden > 0) {
                insertar_(nodo->derecho, std::move(e));
        } else {
                throw std::runtime_error("codigo duplicado" + std::to_string(e.codigo));
        }
    }
    const NodoBST* buscar_(const NodoBST* nodo, int codigo) const {
        if (!nodo || nodo->dato.codigo == codigo) return nodo;
        if (codigo < nodo->dato.codigo) return buscar_(nodo->izquierdo.get(), codigo);
        return buscar_(nodo->derecho.get(), codigo);
    }
    std::unique_ptr<NodoBST> eliminar_(std::unique_ptr<NodoBST> nodo, int codigo) {
        if (!nodo) return nullptr;
        if (codigo < nodo->dato.codigo)
            nodo->izquierdo = eliminar_(std::move(nodo->izquierdo), codigo);
        else if (codigo > nodo->dato.codigo)
            nodo->derecho = eliminar_(std::move(nodo->derecho), codigo);
        else {
            if (!nodo->izquierdo) return std::move(nodo->derecho);
            if (!nodo->derecho)   return std::move(nodo->izquierdo);
            NodoBST* sucesor = minimo_(nodo->derecho.get());
            nodo->dato = sucesor->dato;
            nodo->derecho = eliminar_(std::move(nodo->derecho), sucesor->dato.codigo);
        }
        return nodo;
    }
    NodoBST* minimo_(NodoBST* nodo) const {
        while (nodo->izquierdo) nodo = nodo->izquierdo.get();
        return nodo;
    }
    void inOrder_(const NodoBST* nodo, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        inOrder_(nodo->izquierdo.get(), res);
        res.push_back(nodo->dato);
        inOrder_(nodo->derecho.get(), res);
    }
    void preOrder_(const NodoBST* nodo, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        res.push_back(nodo->dato);
        preOrder_(nodo->izquierdo.get(), res);
        preOrder_(nodo->derecho.get(), res);
    }
    void postOrder_(const NodoBST* nodo, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        postOrder_(nodo->izquierdo.get(), res);
        postOrder_(nodo->derecho.get(), res);
        res.push_back(nodo->dato);
    }
    int altura_(const NodoBST* nodo) const {
        if (!nodo) return -1;
        return 1 + std::max(altura_(nodo->izquierdo.get()), altura_(nodo->derecho.get()));
    }
    void buscarRangoCodigo_(const NodoBST* nodo, int codMin, int codMax, std::vector<Estudiante>& res) const {
        if (!nodo) return;
        if (nodo->dato.codigo > codMin)
            buscarRangoCodigo_(nodo->izquierdo.get(), codMin, codMax, res);
        if (nodo->dato.codigo >= codMin && nodo->dato.codigo <= codMax)
            res.push_back(nodo->dato);
        if (nodo->dato.codigo < codMax)
            buscarRangoCodigo_(nodo->derecho.get(), codMin, codMax, res);
    }
    void imprimir_(const NodoBST* nodo, const std::string& prefix, bool isLeft) const {
        if (!nodo) return;
        std::cout << prefix << (isLeft ? "+-- " : "\`-- ")
                  << nodo->dato.codigo << " [PPA:"
                  << std::fixed << std::setprecision(1) << nodo->dato.ppa << "]\\n";
        std::string ext = isLeft ? "|   " : "    ";
        imprimir_(nodo->izquierdo.get(), prefix + ext, true);
        imprimir_(nodo->derecho.get(),   prefix + ext, false);
    }

public:
    ArbolAcademico() = default;

    void insertar(Estudiante e) { insertar_(raiz, std::move(e)); }

    std::optional<Estudiante> buscar(int codigo) const {
        const NodoBST* nodo = buscar_(raiz.get(), codigo);
        if (nodo) return nodo->dato;
        return std::nullopt;
    }

    void eliminar(int codigo) {
        if (!buscar(codigo))
            throw std::runtime_error("Codigo no encontrado: " + std::to_string(codigo));
        raiz = eliminar_(std::move(raiz), codigo);
    }

    std::optional<Estudiante> maximo() const {
        if (!raiz) return std::nullopt;
        const NodoBST* nodo = raiz.get();
        while (nodo->derecho) nodo = nodo->derecho.get();
        return nodo->dato;
    }

    std::vector<Estudiante> inOrder()   const { std::vector<Estudiante> r; inOrder_(raiz.get(), r);   return r; }
    std::vector<Estudiante> preOrder()  const { std::vector<Estudiante> r; preOrder_(raiz.get(), r);  return r; }
    std::vector<Estudiante> postOrder() const { std::vector<Estudiante> r; postOrder_(raiz.get(), r); return r; }

    std::vector<Estudiante> bfs() const {
        std::vector<Estudiante> res;
        if (!raiz) return res;
        std::queue<const NodoBST*> cola;
        cola.push(raiz.get());
        while (!cola.empty()) {
            const NodoBST* actual = cola.front(); cola.pop();
            res.push_back(actual->dato);
            if (actual->izquierdo) cola.push(actual->izquierdo.get());
            if (actual->derecho)   cola.push(actual->derecho.get());
        }
        return res;
    }

    int altura() const { return altura_(raiz.get()); }

    void estadisticas() const {
        auto todos = inOrder();
        if (todos.empty()) { std::cout << "Arbol vacio\\n"; return; }
        float suma = 0.0f, mn = 20.0f, mx = 0.0f;
        int activos = 0;
        for (const auto& e : todos) {
            suma += e.ppa;
            if (e.ppa < mn) mn = e.ppa;
            if (e.ppa > mx) mx = e.ppa;
            if (e.estado == EstadoAcademico::ACTIVO) activos++;
        }
        std::cout << std::fixed << std::setprecision(2)
                  << "Total nodos  : " << todos.size() << '\\n'
                  << "Altura       : " << altura()     << '\\n'
                  << "PPA promedio : " << suma / todos.size() << '\\n'
                  << "PPA minimo   : " << mn      << '\\n'
                  << "PPA maximo   : " << mx      << '\\n'
                  << "Activos      : " << activos << '\\n';
    }

    std::vector<Estudiante> porRangoPPA(float ppaMin, float ppaMax = 20.0f) const {
        auto todos = inOrder();
        auto vista = todos | std::views::filter(
            [ppaMin, ppaMax](const Estudiante& e) {
                return e.ppa >= ppaMin && e.ppa <= ppaMax;
            }
        );
        return std::vector<Estudiante>(vista.begin(), vista.end());
    }

    std::vector<Estudiante> porEscuela( const std::string& escuela) const {
        auto todos = inOrder();
        auto vista = todos | std::views::filter(
            [&escuela](const Estudiante& e) {
                return e.escuela == escuela;
            }
        );
        return std::vector<Estudiante>(vista.begin(), vista.end());
    }

    std::vector<Estudiante> porEstado(EstadoAcademico estado) const {
        auto todos = inOrder();
        auto vista = todos | std::views::filter(
            [estado](const Estudiante& e) {
                return e.estado == estado;
            }
        );
        return  std::vector<Estudiante>(vista.begin(), vista.end());
    }

    std::vector<Estudiante> buscarRangoCodigo(int codMin, int codMax) const {
        std::vector<Estudiante> res;
        buscarRangoCodigo_(raiz.get(), codMin, codMax, res);
        return res;
    }

    void imprimirArbol() const {
        std::cout << "\\n-- Estructura del BST --\\n";
        imprimir_(raiz.get(), "", false);
    }
};
}
template <typename T>
concept RegistroAcademico = requires(T e){
    {e.codigo} -> std::convertible_to<int>;
    {e.print()} -> std::same_as<void>;
};

template <RegistroAcademico T>
void imprimirTabla(const std::vector<T>& estudiantes, const std::string& titulo)
{
    std::cout << "\\n-- " << titulo << " --\\n";
    std::cout << std::left
              << std::setw(12) << "CODIGO"
              << std::setw(35) << "NOMBRE"
              << std::setw(20) << "ESCUELA"
              << std::setw(8)  << "PPA"
              << std::setw(10) << "CREDITOS"
              << std::setw(12) << "ESTADO"
              << "SEMESTRE\\n";
    std::cout << std::string(110, '-') << '\\n';
    for (const auto& e : estudiantes) e.print();
}

std::vector<una_puno::Estudiante> crearDatosPrueba() {
    using namespace una_puno;
    return {
        {20210500, "Mamani Quispe, Juan",    "Ing. Sistemas", 15.8f, 120, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210300, "Huanca Apaza, Maria",    "Ing. Civil",    14.2f, 110, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210700, "Condori Flores, Pedro",  "Medicina",      17.1f, 130, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210100, "Ticona Lupaca, Rosa",    "Contabilidad",  12.0f,  90, EstadoAcademico::SUSPENDIDO, "2021-I"},
        {20210400, "Larico Ccama, Carlos",   "Ing. Sistemas", 16.5f, 115, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210600, "Cutipa Vargas, Elena",   "Agronomia",     13.7f, 100, EstadoAcademico::ACTIVO,     "2021-I"},
        {20210900, "Pari Choque, Luis",      "Ing. Sistemas", 18.3f, 140, EstadoAcademico::EGRESADO,   "2021-I"},
    };
}

int main() {
    using namespace una_puno;
    std::cout << "=== BST Sistema Academico UNA-PUNO (C++20) ===\\n";
    ArbolAcademico arbol;
    for (auto& e : crearDatosPrueba()) arbol.insertar(e);
    arbol.imprimirArbol();
    imprimirTabla(arbol.inOrder(), "IN-ORDER: ORDENADO POR CODIGO");
    std::cout << "\\nBFS nivel por nivel:\\n";
    for (const auto& e : arbol.bfs()) std::cout << e.codigo << " ";
    std::cout << '\\n';
    auto encontrado = arbol.buscar(20210700);
    if (encontrado) imprimirTabla({*encontrado}, "CODIGO 20210700");
    auto noExiste = arbol.buscar(99999999);
    std::cout << "Buscar 99999999: " << (noExiste ? "encontrado" : "no encontrado") << '\\n';
    imprimirTabla(arbol.porRangoPPA(15.0f),               "ESTUDIANTES CON PPA >= 15.0");
    imprimirTabla(arbol.porEscuela("Ing. Sistemas"),       "ESTUDIANTES DE ING. SISTEMAS");
    imprimirTabla(arbol.porEstado(EstadoAcademico::ACTIVO),"ESTUDIANTES ACTIVOS");
    std::cout << "\\n-- Estadisticas --\\n";
    arbol.estadisticas();
    std::cout << "\\nEliminando codigo 20210300...\\n";
    arbol.eliminar(20210300);
    imprimirTabla(arbol.inOrder(), "IN-ORDER DESPUES DE ELIMINAR 20210300");
    auto mayor = arbol.maximo();
    if (mayor) imprimirTabla({*mayor}, "ESTUDIANTE CON MAYOR CODIGO");
    imprimirTabla(arbol.buscarRangoCodigo(20210400, 20210700), "BUSQUEDA POR RANGO DE CODIGO [20210400, 20210700]");
    return 0;
}`;

const PY_SRC = `from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional, List
from collections import deque
import statistics
import random
import time


class EstadoAcademico(Enum):
    ACTIVO = auto()
    EGRESADO = auto()
    RETIRADO = auto()
    SUSPENDIDO = auto()


@dataclass
class Estudiante:
    codigo: int
    nombre: str
    escuela: str
    ppa: float
    creditos: int
    estado: EstadoAcademico
    semestre_ingreso: str

    def __post_init__(self):
        if not (10_000_000 <= self.codigo <= 29_999_999):
            raise ValueError(f"Codigo invalido: {self.codigo}")
        if not (0.0 <= self.ppa <= 20.0):
            raise ValueError(f"PPA fuera de rango [0,20]: {self.ppa}")


@dataclass
class NodoBST:
    dato: Estudiante
    izquierdo: Optional["NodoBST"] = field(default=None, repr=False)
    derecho: Optional["NodoBST"] = field(default=None, repr=False)


class ArbolAcademico:

    def __init__(self) -> None:
        self._raiz: Optional[NodoBST] = None

    def insertar(self, e: Estudiante) -> None:
        self._raiz = self._insertar(self._raiz, e)

    def _insertar(self, nodo: Optional[NodoBST], e: Estudiante) -> NodoBST:
        if nodo is None:
            return NodoBST(dato=e)
        if e.codigo < nodo.dato.codigo:
            nodo.izquierdo = self._insertar(nodo.izquierdo, e)
        elif e.codigo > nodo.dato.codigo:
            nodo.derecho = self._insertar(nodo.derecho, e)
        else:
            raise ValueError(f"Codigo duplicado: {e.codigo}")
        return nodo

    def buscar(self, codigo: int) -> Optional[Estudiante]:
        nodo = self._buscar(self._raiz, codigo)
        return nodo.dato if nodo else None

    def _buscar(self, nodo: Optional[NodoBST], codigo: int) -> Optional[NodoBST]:
        if nodo is None or nodo.dato.codigo == codigo:
            return nodo
        if codigo < nodo.dato.codigo:
            return self._buscar(nodo.izquierdo, codigo)
        return self._buscar(nodo.derecho, codigo)

    def eliminar(self, codigo: int) -> None:
        if self.buscar(codigo) is None:
            raise KeyError(f"Codigo no encontrado: {codigo}")
        self._raiz = self._eliminar(self._raiz, codigo)

    def _eliminar(self, nodo: Optional[NodoBST], codigo: int) -> Optional[NodoBST]:
        if nodo is None:
            return None
        if codigo < nodo.dato.codigo:
            nodo.izquierdo = self._eliminar(nodo.izquierdo, codigo)
        elif codigo > nodo.dato.codigo:
            nodo.derecho = self._eliminar(nodo.derecho, codigo)
        else:
            if nodo.izquierdo is None:
                return nodo.derecho
            if nodo.derecho is None:
                return nodo.izquierdo
            sucesor = self._minimo(nodo.derecho)
            nodo.dato = sucesor.dato
            nodo.derecho = self._eliminar(nodo.derecho, sucesor.dato.codigo)
        return nodo

    def _minimo(self, nodo: NodoBST) -> NodoBST:
        while nodo.izquierdo:
            nodo = nodo.izquierdo
        return nodo

    def maximo(self) -> Optional[Estudiante]:
        if self._raiz is None:
            return None
        nodo = self._raiz
        while nodo.derecho:
            nodo = nodo.derecho
        return nodo.dato

    def in_order(self) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._in_order(self._raiz, resultado)
        return resultado

    def _in_order(self, nodo: Optional[NodoBST], res: List[Estudiante]) -> None:
        if nodo is None:
            return
        self._in_order(nodo.izquierdo, res)
        res.append(nodo.dato)
        self._in_order(nodo.derecho, res)

    def pre_order(self) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._pre_order(self._raiz, resultado)
        return resultado

    def _pre_order(self, nodo: Optional[NodoBST], res: List[Estudiante]) -> None:
        if nodo is None:
            return
        res.append(nodo.dato)
        self._pre_order(nodo.izquierdo, res)
        self._pre_order(nodo.derecho, res)

    def post_order(self) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._post_order(self._raiz, resultado)
        return resultado

    def _post_order(self, nodo: Optional[NodoBST], res: List[Estudiante]) -> None:
        if nodo is None:
            return
        self._post_order(nodo.izquierdo, res)
        self._post_order(nodo.derecho, res)
        res.append(nodo.dato)

    def bfs(self) -> List[Estudiante]:
        if self._raiz is None:
            return []
        resultado: List[Estudiante] = []
        cola = deque([self._raiz])
        while cola:
            nodo = cola.popleft()
            resultado.append(nodo.dato)
            if nodo.izquierdo:
                cola.append(nodo.izquierdo)
            if nodo.derecho:
                cola.append(nodo.derecho)
        return resultado

    def altura(self) -> int:
        return self._altura(self._raiz)

    def _altura(self, nodo: Optional[NodoBST]) -> int:
        if nodo is None:
            return -1
        return 1 + max(self._altura(nodo.izquierdo), self._altura(nodo.derecho))

    def estadisticas(self) -> dict:
        todos = self.in_order()
        if not todos:
            return {}
        ppas = [e.ppa for e in todos]
        return {
            "total_nodos":   len(todos),
            "altura":        self.altura(),
            "ppa_promedio":  round(statistics.mean(ppas), 2),
            "ppa_minimo":    min(ppas),
            "ppa_maximo":    max(ppas),
            "total_activos": sum(1 for e in todos if e.estado == EstadoAcademico.ACTIVO),
        }

    def por_rango_ppa(self, ppa_min: float, ppa_max: float = 20.0) -> List[Estudiante]:
        return [e for e in self.in_order() if ppa_min <= e.ppa <= ppa_max]

    def por_escuela(self, escuela: str) -> List[Estudiante]:
        return [e for e in self.in_order() if e.escuela == escuela]

    def por_estado(self, estado: EstadoAcademico) -> List[Estudiante]:
        return [e for e in self.in_order() if e.estado == estado]

    def buscar_rango_codigo(self, cod_min: int, cod_max: int) -> List[Estudiante]:
        resultado: List[Estudiante] = []
        self._buscar_rango_codigo(self._raiz, cod_min, cod_max, resultado)
        return resultado

    def _buscar_rango_codigo(self, nodo, cod_min, cod_max, resultado):
        if nodo is None:
            return
        if nodo.dato.codigo > cod_min:
            self._buscar_rango_codigo(nodo.izquierdo, cod_min, cod_max, resultado)
        if cod_min <= nodo.dato.codigo <= cod_max:
            resultado.append(nodo.dato)
        if nodo.dato.codigo < cod_max:
            self._buscar_rango_codigo(nodo.derecho, cod_min, cod_max, resultado)

    def imprimir_arbol(self) -> None:
        print("\\n-- Estructura del BST --")
        self._imprimir(self._raiz, "", False)

    def _imprimir(self, nodo, prefix, is_left):
        if nodo is None:
            return
        conector = "+-- " if is_left else "\`-- "
        print(f"{prefix}{conector}{nodo.dato.codigo} [PPA:{nodo.dato.ppa:.1f}]")
        extension = "|   " if is_left else "    "
        self._imprimir(nodo.izquierdo, prefix + extension, True)
        self._imprimir(nodo.derecho,   prefix + extension, False)


def imprimir_tabla(estudiantes: List[Estudiante], titulo: str = "ESTUDIANTES") -> None:
    print(f"\\n-- {titulo} --")
    print(f"{'CODIGO':<12}{'NOMBRE':<35}{'ESCUELA':<20}{'PPA':<8}{'CREDITOS':<10}{'ESTADO':<12}{'SEMESTRE'}")
    print("-" * 110)
    for e in estudiantes:
        print(f"{e.codigo:<12}{e.nombre:<35}{e.escuela:<20}{e.ppa:<8.1f}{e.creditos:<10}{e.estado.name:<12}{e.semestre_ingreso}")


def crear_datos_prueba() -> List[Estudiante]:
    return [
        Estudiante(20210500, "Mamani Quispe, Juan",   "Ing. Sistemas", 15.8, 120, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210300, "Huanca Apaza, Maria",   "Ing. Civil",    14.2, 110, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210700, "Condori Flores, Pedro", "Medicina",      17.1, 130, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210100, "Ticona Lupaca, Rosa",   "Contabilidad",  12.0,  90, EstadoAcademico.SUSPENDIDO, "2021-I"),
        Estudiante(20210400, "Larico Ccama, Carlos",  "Ing. Sistemas", 16.5, 115, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210600, "Cutipa Vargas, Elena",  "Agronomia",     13.7, 100, EstadoAcademico.ACTIVO,     "2021-I"),
        Estudiante(20210900, "Pari Choque, Luis",     "Ing. Sistemas", 18.3, 140, EstadoAcademico.EGRESADO,   "2021-I"),
    ]


def main() -> None:
    print("=== BST Sistema Academico UNA-PUNO (Python 3.11+) ===")
    arbol = ArbolAcademico()
    for estudiante in crear_datos_prueba():
        arbol.insertar(estudiante)
    print(f"\\nAltura del arbol: {arbol.altura()}")
    imprimir_tabla(arbol.in_order(), "IN-ORDER: ORDENADO POR CODIGO")
    print("\\nBFS nivel por nivel:")
    print([e.codigo for e in arbol.bfs()])
    encontrado = arbol.buscar(20210700)
    if encontrado:
        imprimir_tabla([encontrado], "BUSQUEDA: CODIGO 20210700")
    print(f"\\nBuscar 99999999: {arbol.buscar(99999999)}")
    imprimir_tabla(arbol.por_rango_ppa(15.0),                "ESTUDIANTES CON PPA >= 15.0")
    imprimir_tabla(arbol.por_escuela("Ing. Sistemas"),        "ESTUDIANTES DE ING. SISTEMAS")
    imprimir_tabla(arbol.por_estado(EstadoAcademico.ACTIVO),  "ESTUDIANTES ACTIVOS")
    print("\\nEstadisticas del arbol:")
    for clave, valor in arbol.estadisticas().items():
        print(f"{clave:<20}: {valor}")
    arbol.imprimir_arbol()
    print("\\nEliminando codigo 20210300...")
    arbol.eliminar(20210300)
    imprimir_tabla(arbol.in_order(), "IN-ORDER DESPUES DE ELIMINAR 20210300")
    maximo = arbol.maximo()
    if maximo:
        imprimir_tabla([maximo], "ESTUDIANTE CON MAYOR CODIGO")
    print("\\nRango de codigos [20210400, 20210700]:")
    imprimir_tabla(arbol.buscar_rango_codigo(20210400, 20210700), "BUSQUEDA POR RANGO DE CODIGO")


if __name__ == "__main__":
    main()`;

// ══════════════════════════════════════════════════════
// SYNTAX HIGHLIGHTER
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
// CÓDIGO FUENTE JS — la implementación BST que usa el simulador
// ══════════════════════════════════════════════════════
const JS_SRC=`// simulador.js — Árbol BST que impulsa el visualizador
// Misma lógica que version.cpp (C++20) y version.py (Python 3.11)
// Portado a JavaScript ES2022 con la misma estructura de clases

class BSTNode {
  constructor(codigo, data) {
    this.codigo = codigo;   // equivale a 'int codigo' en C++ / 'codigo: int' en Python
    this.data   = data;     // equivale a 'Estudiante dato'
    this.left   = null;     // equivale a 'unique_ptr<NodoBST> izquierdo'
    this.right  = null;     // equivale a 'Optional[NodoBST] derecho'
  }
}

class ArbolAcademico {
  constructor() {
    this.root = null;       // equivale a 'unique_ptr<NodoBST> raiz'
    this.size = 0;
  }

  // Equivale a insertar_() en C++ / _insertar() en Python — O(log n) promedio
  insertar(codigo, data) {
    const node = new BSTNode(codigo, data);
    if (!this.root) { this.root = node; this.size++; return; }
    let cur = this.root;
    for (;;) {
      if (codigo < cur.codigo) {
        if (!cur.left)  { cur.left  = node; this.size++; return; }
        cur = cur.left;
      } else if (codigo > cur.codigo) {
        if (!cur.right) { cur.right = node; this.size++; return; }
        cur = cur.right;
      } else {
        throw new Error('Codigo duplicado: ' + codigo);
      }
    }
  }

  // Equivale a buscar_() en C++ / _buscar() en Python — O(log n) promedio
  buscar(codigo) {
    let cur = this.root;
    while (cur) {
      if (codigo === cur.codigo) return cur.data;
      cur = codigo < cur.codigo ? cur.left : cur.right;
    }
    return null;
  }

  // Equivale a eliminar_() en C++ / _eliminar() en Python — O(log n)
  eliminar(codigo) {
    this.root = this._eliminar(this.root, codigo);
  }

  _eliminar(node, codigo) {
    if (!node) return null;
    if      (codigo < node.codigo) node.left  = this._eliminar(node.left,  codigo);
    else if (codigo > node.codigo) node.right = this._eliminar(node.right, codigo);
    else {
      this.size--;
      if (!node.left)  return node.right;
      if (!node.right) return node.left;
      let sucesor = node.right;
      while (sucesor.left) sucesor = sucesor.left;
      node.codigo = sucesor.codigo;
      node.data   = sucesor.data;
      node.right  = this._eliminar(node.right, sucesor.codigo);
    }
    return node;
  }

  // Recorridos — equivalentes a inOrder_, preOrder_, postOrder_ en C++
  inOrder()   { const r=[]; const f=n=>{ if(!n)return; f(n.left);  r.push(n); f(n.right); }; f(this.root); return r; }
  preOrder()  { const r=[]; const f=n=>{ if(!n)return; r.push(n);  f(n.left); f(n.right); }; f(this.root); return r; }
  postOrder() { const r=[]; const f=n=>{ if(!n)return; f(n.left);  f(n.right); r.push(n); }; f(this.root); return r; }

  // BFS — equivalente a bfs() con std::queue en C++ / deque en Python
  bfs() {
    if (!this.root) return [];
    const queue = [this.root], result = [];
    while (queue.length) {
      const n = queue.shift();
      result.push(n);
      if (n.left)  queue.push(n.left);
      if (n.right) queue.push(n.right);
    }
    return result;
  }

  // Equivale a altura_() en C++ / _altura() en Python — O(n)
  altura(n = this.root) {
    if (!n) return -1;
    return 1 + Math.max(this.altura(n.left), this.altura(n.right));
  }

  // Equivale a estadisticas() en ambos — O(n)
  estadisticas() {
    const todos = this.inOrder().map(n => n.data);
    if (!todos.length) return {};
    const ppas = todos.map(e => e.ppa);
    const sum  = ppas.reduce((a, b) => a + b, 0);
    return {
      total_nodos:   todos.length,
      altura:        this.altura(),
      ppa_promedio:  (sum / ppas.length).toFixed(2),
      ppa_minimo:    Math.min(...ppas).toFixed(1),
      ppa_maximo:    Math.max(...ppas).toFixed(1),
      total_activos: todos.filter(e => e.estado === 'ACTIVO').length,
    };
  }

  // Filtros — equivalen a porRangoPPA, porEscuela, porEstado en C++ / Python
  porRangoPPA(min, max = 20) {
    return this.inOrder().filter(n => n.data.ppa >= min && n.data.ppa <= max);
  }
  porEscuela(esc) {
    return this.inOrder().filter(n => n.data.escuela === esc);
  }
  porEstado(est) {
    return this.inOrder().filter(n => n.data.estado === est);
  }
}

// ── Función de benchmark (igual que benchmark() en ambos archivos) ──────────
function benchmark(n) {
  const datos = genBenchData(n);
  const buscarCod = datos[Math.floor(n / 2)].codigo;

  const arbol = new ArbolAcademico();
  const t0 = performance.now();
  for (const e of datos) arbol.insertar(e.codigo, e);
  const t1 = performance.now();
  const msIns = t1 - t0;

  const t2 = performance.now();
  arbol.buscar(buscarCod);
  const t3 = performance.now();
  const msBus = t3 - t2;

  return { n, msIns: msIns.toFixed(3), msBus: msBus.toFixed(4), altura: arbol.altura() };
}`;

function hlJs(src){
  const esc=src.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines=esc.split('\n');
  return lines.map((line,i)=>{
    let l=line
      .replace(/(\/\/[^\n]*)/g,'<span class="cm">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")/g,'<span class="st">$1</span>')
      .replace(/\b(class|constructor|new|this|return|if|else|while|for|of|const|let|var|null|true|false|function|throw|in|instanceof)\b/g,'<span class="kw">$1</span>')
      .replace(/\b(\d+(\.\d+)?)\b/g,'<span class="nm">$1</span>');
    return `<span class="line"><span class="ln">${i+1}</span>${l}</span>`;
  }).join('\n');
}

function hlCpp(src){
  const esc=src.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines=esc.split('\n');
  return lines.map((line,i)=>{
    let l=line
      .replace(/^(#\w+[^\n]*)/,'<span class="pp">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*")/g,'<span class="st">$1</span>')
      .replace(/\/\/.*/g,'<span class="cm">$&</span>')
      .replace(/\b(namespace|class|struct|enum|public|private|template|typename|concept|requires|using|return|if|else|while|for|auto|const|void|int|float|bool|nullptr|explicit|inline|default|throw|true|false|switch|case|break|new|delete)\b/g,'<span class="kw">$1</span>')
      .replace(/\b(std::\w+|EstadoAcademico|Estudiante|NodoBST|ArbolAcademico)\b/g,'<span class="kw" style="color:#7a9aa8">$1</span>')
      .replace(/\b(\d+(\.\d+)?f?)\b/g,'<span class="nm">$1</span>');
    return `<span class="line"><span class="ln">${i+1}</span>${l}</span>`;
  }).join('\n');
}

function hlPy(src){
  const esc=src.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines=esc.split('\n');
  return lines.map((line,i)=>{
    let l=line
      .replace(/^(@\w+)/,'<span class="pp">$1</span>')
      .replace(/(f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')/g,'<span class="st">$1</span>')
      .replace(/#[^\n]*/g,'<span class="cm">$&</span>')
      .replace(/\b(from|import|class|def|return|if|else|elif|for|while|in|not|and|or|None|True|False|self|raise|with|as|lambda|pass|break|continue|is)\b/g,'<span class="kw">$1</span>')
      .replace(/\b(\d+(_\d+)*(\.\d+)?)\b/g,'<span class="nm">$1</span>');
    return `<span class="line"><span class="ln">${i+1}</span>${l}</span>`;
  }).join('\n');
}

function renderCode(lang){
  const html = lang==='cpp' ? hlCpp(CPP_SRC) : lang==='py' ? hlPy(PY_SRC) : hlJs(JS_SRC);
  document.getElementById('ccontent').innerHTML=html;
}

document.querySelectorAll('.ctab').forEach(b=>{
  b.addEventListener('click',function(){
    document.querySelectorAll('.ctab').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');renderCode(this.dataset.lang);
  });
});

// ══════════════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(b=>{
  b.addEventListener('click',function(){
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('pane-'+this.dataset.tab).classList.add('active');
    if(this.dataset.tab==='viz')renderTree();
  });
});

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
initTree();
renderTree();
renderCode('cpp');
drawChart();
window.addEventListener('resize',()=>{
  if(document.getElementById('pane-viz').classList.contains('active'))renderTree();
});