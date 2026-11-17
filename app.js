/* MNBC · lógica. Edita CONFIG para tus datos bancarios. */
const CONFIG={banco:'[Banco — completar]',cuenta:'[Número de cuenta — completar]',titular:'Movimiento Nacional Unidos por un Bien Común',admin:{email:'admin@mnbc.do',pass:'Admin2026'},contable:{email:'contable@mnbc.do',pass:'Contable2026'}};
const LINEAS=[["Educación y ciudadanía","Formación cívica, valores, derechos y deberes ciudadanos y liderazgo."],["Familia y desarrollo social","Programas que fortalezcan los vínculos familiares, la convivencia y la solidaridad."],["Juventud y formación","Liderazgo, disciplina, responsabilidad y participación."],["Cultura e identidad nacional","Historia, cultura, arte, tradiciones y valores dominicanos."],["Desarrollo comunitario","Identificar necesidades y construir soluciones colectivas."],["Medio ambiente y sostenibilidad","Educación ambiental y protección de nuestros recursos naturales."],["Emprendimiento y desarrollo económico","Capacidades, oportunidades e iniciativas de desarrollo."]];
const VALORES=["Unidad","Civismo","Integridad","Respeto","Solidaridad","Responsabilidad","Compromiso","Justicia","Disciplina","Amor a la patria"];
const $=s=>document.querySelector(s),val=id=>($(id)?.value||'').trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d?new Date(d+'T12:00').toLocaleDateString('es-DO',{day:'numeric',month:'long',year:'numeric'}):'';
const dt=t=>new Date(t).toLocaleString('es-DO',{dateStyle:'short',timeStyle:'short'});
const money=n=>'RD$ '+(+n||0).toLocaleString('es-DO',{minimumFractionDigits:2,maximumFractionDigits:2});
/* ---- Almacenamiento ---- */
const mem={};
const load=(k,d)=>{try{const v=localStorage.getItem('mnbc_'+k);return v?JSON.parse(v):d}catch(e){return mem[k]??d}};
const save=(k,v)=>{mem[k]=v;try{localStorage.setItem('mnbc_'+k,JSON.stringify(v))}catch(e){}};
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('mnbc:'+s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
let users=load('users',[]),events=load('events',[]),news=load('news',[]),regs=load('regs',[]),movs=load('movs',[]),logs=load('logs',[]),me=load('session',null),tab='inicio',msg='',edEv=null,edNw=null,filt='todos';
/* ---- Roles ---- */
const isAdmin=()=>me&&(me.admin||me.rol==='admin');
const isCont=()=>me&&(isAdmin()||me.rol==='contable');
function log(accion,detalle){logs.unshift({at:Date.now(),por:me?me.name+' ('+(isAdmin()?'admin':me.rol||'usuario')+')':'Visitante',accion,detalle});logs=logs.slice(0,500);save('logs',logs)}
async function init(){
 if(!users.some(u=>u.admin||u.rol==='admin'))users.push({id:'admin',name:'Administrador',email:CONFIG.admin.email,pass:await sha(CONFIG.admin.pass),rol:'admin',admin:true,role:'Administrador'});
 if(!users.some(u=>u.rol==='contable'))users.push({id:'contable',name:'Contabilidad',email:CONFIG.contable.email,pass:await sha(CONFIG.contable.pass),rol:'contable',role:'Contable'});
 save('users',users);me=me&&users.find(u=>u.id===me)||null;render()}
function nav(){const t=[['inicio','Inicio'],['eventos','Eventos'],['donar','Donar'],['unete','Únete']];if(me)t.push(['perfil','Mi perfil']);if(isCont())t.push(['conta','Contabilidad']);if(isAdmin())t.push(['admin','Administración']);
 $('#nav').innerHTML=t.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="go('${k}')">${l}</button>`).join('')+(me?`<button onclick="logout()">Salir</button>`:`<button class="btn" onclick="go('login')">Entrar</button>`)}
function go(k){tab=k;msg='';render();scrollTo(0,0)}
function render(){nav();$('#app').innerHTML=({inicio,eventos,donar,unete,login,perfil,conta,admin:adminV}[tab]||inicio)()}
const M=()=>msg?`<div class="note">${esc(msg)}</div>`:'';
const done=(m,t)=>{msg=m;if(t)tab=t;render();scrollTo(0,0)};
/* ---- Vistas ---- */
function inicio(){return `<div class="hero"><div class="w"><img src="logo.jpg" alt=""><h1>Unidos por el desarrollo humano sostenible</h1>
<p>Una iniciativa ciudadana que promueve la unidad, la participación responsable y el desarrollo integral de la República Dominicana.</p>
<button class="btn" onclick="go('unete')">Quiero ser parte</button> <button class="btn o" onclick="go('donar')">Hacer una donación</button></div></div>
<section><div class="w"><p class="q">“Unidos podemos transformar nuestras comunidades y contribuir a construir una mejor Nación.”</p></div></section>
<section><div class="w g"><div class="c"><h3>Misión</h3><p class="m">Promover el desarrollo humano integral mediante la educación, la formación ciudadana, el liderazgo ético, la participación comunitaria, el fortalecimiento de la familia, la cultura, la identidad nacional, el emprendimiento y el cuidado del medio ambiente.</p></div>
<div class="c"><h3>Visión</h3><p class="m">Ser un movimiento nacional reconocido por impulsar ciudadanos conscientes, responsables, solidarios y comprometidos con una República Dominicana más unida, justa, participativa, sostenible y orientada al bien común.</p></div></div></section>
${news.length?`<section><div class="w"><h2>Anuncios</h2><div class="g">${news.slice(0,3).map(n=>`<div class="c"><h3>${esc(n.title)}</h3><p class="m">${esc(n.body)}</p></div>`).join('')}</div></div></section>`:''}
<section><div class="w"><h2>Líneas de acción</h2><div class="g">${LINEAS.map(l=>`<div class="c"><h3>${l[0]}</h3><p class="m">${l[1]}</p></div>`).join('')}</div></div></section>
<section><div class="w"><h2>Nuestros valores</h2><p>${VALORES.map((v,i)=>`<span class="tag ${i%2?'r':''}">${v}</span>`).join(' ')}</p>
<p class="m">Dirigido a toda la sociedad dominicana, dentro del país y en el exterior.</p></div></section>`}
const cnt=id=>regs.filter(r=>r.eid===id).length,mine=id=>me&&regs.some(r=>r.eid===id&&r.uid===me.id);
function eventos(){return `<section><div class="w"><h2>Eventos y actividades</h2>${M()}${!me?'<div class="note">Inicia sesión o regístrate para inscribirte a los eventos.</div>':''}
<div class="g">${events.length?[...events].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<div class="c"><span class="tag">${fmt(e.date)}</span><h3>${esc(e.title)}</h3><p class="m">📍 ${esc(e.place)}${e.time?' · '+esc(e.time):''}</p><p>${esc(e.desc)}</p>
<p class="m">${cnt(e.id)} inscritos${e.cap?' de '+e.cap:''}</p>${mine(e.id)?`<button class="btn o" onclick="unreg('${e.id}')">✓ Inscrito · cancelar</button>`:`<button class="btn" onclick="reg('${e.id}')">Inscribirme</button>`}</div>`).join(''):'<p class="m">Aún no hay eventos publicados.</p>'}</div></div></section>`}
function donar(){return `<section><div class="w"><h2>Haz una donación</h2><p class="m">Tu aporte se registra como <b>pendiente</b> hasta que el equipo de contabilidad verifique el pago y emita un número de recibo.</p>${M()}
<div class="g"><div class="c"><h3>Datos para el aporte</h3><p class="m">Banco: <b>${esc(CONFIG.banco)}</b><br>Cuenta: <b>${esc(CONFIG.cuenta)}</b><br>Titular: <b>${esc(CONFIG.titular)}</b></p></div>
<div class="c"><h3>Registrar mi donación</h3><label>Nombre</label><input id="dn" value="${esc(me?.name||'')}"><label>Correo</label><input id="de" type="email" value="${esc(me?.email||'')}">
<label>Monto (RD$)</label><input id="da" type="number" min="1" step="0.01"><label>Método</label><select id="dm"><option>Transferencia</option><option>Depósito</option><option>Efectivo</option><option>Otro</option></select>
<label>Nº de referencia / comprobante</label><input id="dr"><label>Fecha del aporte</label><input id="dd" type="date" value="${new Date().toISOString().slice(0,10)}"><label>Nota (opcional)</label><textarea id="dx" rows="2"></textarea>
<button class="btn" onclick="addDon()">Enviar donación</button></div></div></div></section>`}
function unete(){return `<section><div class="w"><h2>Únete al movimiento</h2>${M()}
${me?'<div class="note">Ya tienes cuenta. Revisa <b>Mi perfil</b> o inscríbete en los <b>Eventos</b>.</div>':`<div class="c" style="max-width:520px">
<label>Nombre completo</label><input id="rn"><label>Correo electrónico</label><input id="re" type="email"><label>Contraseña (mín. 6)</label><input id="rp" type="password">
<label>Teléfono / WhatsApp</label><input id="rt"><label>Ciudad o comunidad</label><input id="rc">
<label>¿Cómo quieres participar?</label><select id="rr"><option>Miembro</option><option>Voluntario</option><option>Líder comunitario</option><option>Educador / profesional</option><option>Emprendedor</option><option>Joven</option></select>
<button class="btn" onclick="signup()">Crear cuenta</button> <button class="btn o" onclick="go('login')">Ya tengo cuenta</button></div>`}</div></section>`}
function login(){return `<section><div class="w"><h2>Iniciar sesión</h2>${M()}<div class="c" style="max-width:420px"><label>Correo</label><input id="le" type="email"><label>Contraseña</label><input id="lp" type="password">
<button class="btn" onclick="doLogin()">Entrar</button> <button class="btn o" onclick="go('unete')">Crear cuenta</button></div></div></section>`}
function perfil(){const my=regs.filter(r=>r.uid===me.id).map(r=>events.find(e=>e.id===r.eid)).filter(Boolean),md=movs.filter(m=>m.tipo==='ingreso'&&m.email&&m.email===me.email);
return `<section><div class="w"><h2>Mi perfil</h2>${M()}<div class="g"><div class="c"><h3>${esc(me.name)}</h3><p class="m">${esc(me.email)}<br>${esc(me.phone||'')} · ${esc(me.city||'')}<br><span class="tag">${esc(me.role)}</span></p></div>
<div class="c"><h3>Mis eventos</h3>${my.length?my.map(e=>`<p>• ${esc(e.title)} <span class="m">(${fmt(e.date)})</span></p>`).join(''):'<p class="m">Aún no te has inscrito.</p>'}</div>
<div class="c"><h3>Mis donaciones</h3>${md.length?md.map(m=>`<p>• ${money(m.monto)} ${tagEst(m.estado)} <span class="m">${m.recibo||''}</span></p>`).join(''):'<p class="m">Sin donaciones registradas.</p>'}</div>
<div class="c"><h3>Cambiar contraseña</h3><input id="np" type="password" placeholder="Nueva contraseña (mín. 6)"><button class="btn" onclick="chpass()">Guardar</button></div></div></div></section>`}
const tagEst=e=>`<span class="tag ${e==='verificado'?'ok':e==='rechazado'?'r':'y'}">${e}</span>`;
function conta(){if(!isCont())return '<section><div class="w"><p>Acceso restringido.</p></div></section>';
 const ver=movs.filter(m=>m.estado==='verificado'),ing=ver.filter(m=>m.tipo==='ingreso').reduce((a,m)=>a+m.monto,0),egr=ver.filter(m=>m.tipo==='egreso').reduce((a,m)=>a+m.monto,0),pen=movs.filter(m=>m.estado==='pendiente').length;
 const lista=movs.filter(m=>filt==='todos'||m.estado===filt).sort((a,b)=>b.at-a.at);
 return `<section><div class="w"><h2>Contabilidad y verificación</h2>${M()}
<div class="g"><div class="c"><p class="m">Ingresos verificados</p><div class="big">${money(ing)}</div></div><div class="c"><p class="m">Egresos verificados</p><div class="big">${money(egr)}</div></div><div class="c"><p class="m">Balance</p><div class="big">${money(ing-egr)}</div></div><div class="c"><p class="m">Pendientes por verificar</p><div class="big">${pen}</div></div></div>
<div class="row" style="margin-top:18px"><b>Filtrar:</b><select onchange="filt=this.value;render()">${['todos','pendiente','verificado','rechazado'].map(f=>`<option ${f===filt?'selected':''}>${f}</option>`).join('')}</select>
<button class="btn o" onclick="csvMov()">Descargar CSV</button></div>
<div class="tbl"><table><tr><th>Fecha</th><th>Tipo</th><th>Detalle</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr>${lista.map(m=>`<tr><td>${fmt(m.fecha)}</td><td>${m.tipo}</td>
<td>${esc(m.nombre||m.concepto)}<br><span class="m">${esc(m.metodo||m.categoria||'')} ${m.ref?'· Ref: '+esc(m.ref):''} ${m.nota?'· '+esc(m.nota):''}</span>${m.recibo?`<br><b>Recibo ${m.recibo}</b>`:''}${m.verPor?`<br><span class="m">${m.estado} por ${esc(m.verPor)} el ${dt(m.verAt)}${m.verNota?' — '+esc(m.verNota):''}</span>`:''}</td>
<td>${money(m.monto)}</td><td>${tagEst(m.estado)}</td><td>${m.estado==='pendiente'?`<button class="btn ok s" onclick="verif('${m.id}',true)">Verificar</button> <button class="btn r s" onclick="verif('${m.id}',false)">Rechazar</button> `:''}<button class="btn o s" onclick="editMov('${m.id}')">Editar</button>${isAdmin()?` <button class="btn r s" onclick="delMov('${m.id}')">✕</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="m">Sin movimientos</td></tr>'}</table></div>
<h3 style="margin-top:22px">Registrar egreso (gasto)</h3><div class="c"><div class="g"><div><label>Concepto</label><input id="gc"><label>Categoría</label><select id="gk"><option>Eventos</option><option>Logística</option><option>Formación</option><option>Comunicación</option><option>Administrativo</option><option>Otro</option></select></div>
<div><label>Monto (RD$)</label><input id="ga" type="number" min="1" step="0.01"><label>Fecha</label><input id="gd" type="date" value="${new Date().toISOString().slice(0,10)}"><label>Referencia / factura</label><input id="gr"></div></div><button class="btn" onclick="addEgr()">Registrar egreso</button></div>
<h3 style="margin-top:22px">Bitácora de cambios (auditoría)</h3><div class="tbl"><table><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr>${logs.slice(0,60).map(l=>`<tr><td>${dt(l.at)}</td><td>${esc(l.por)}</td><td>${esc(l.accion)}</td><td>${esc(l.detalle)}</td></tr>`).join('')||'<tr><td colspan="4" class="m">Sin cambios registrados</td></tr>'}</table></div></div></section>`}
function adminV(){if(!isAdmin())return '<section><div class="w"><p>Acceso restringido.</p></div></section>';const ms=users.filter(u=>!(u.admin||u.rol==='admin')),e=events.find(x=>x.id===edEv)||{},n=news.find(x=>x.id===edNw)||{};
return `<section><div class="w"><h2>Panel de administración</h2>${M()}
<div class="g"><div class="c"><h3>${edEv?'Editar':'Nuevo'} evento</h3><input id="et" placeholder="Título" value="${esc(e.title||'')}"><input id="ed" type="date" value="${esc(e.date||'')}"><input id="eh" placeholder="Hora" value="${esc(e.time||'')}"><input id="ep" placeholder="Lugar" value="${esc(e.place||'')}"><input id="ec" type="number" placeholder="Cupo (opcional)" value="${e.cap||''}"><textarea id="ex" rows="3" placeholder="Descripción">${esc(e.desc||'')}</textarea><button class="btn" onclick="saveEv()">${edEv?'Guardar cambios':'Publicar evento'}</button>${edEv?' <button class="btn o" onclick="edEv=null;render()">Cancelar</button>':''}</div>
<div class="c"><h3>${edNw?'Editar':'Nuevo'} anuncio</h3><input id="nt" placeholder="Título" value="${esc(n.title||'')}"><textarea id="nb" rows="6" placeholder="Mensaje">${esc(n.body||'')}</textarea><button class="btn" onclick="saveNw()">${edNw?'Guardar cambios':'Publicar anuncio'}</button>${edNw?' <button class="btn o" onclick="edNw=null;render()">Cancelar</button>':''}</div></div>
<h3 style="margin-top:22px">Eventos (${events.length})</h3><div class="tbl"><table>${events.map(e=>`<tr><td>${esc(e.title)}<br><span class="m">${fmt(e.date)}</span></td><td>${cnt(e.id)} inscritos</td><td><button class="btn o s" onclick="edEv='${e.id}';render()">Editar</button> <button class="btn r s" onclick="del('events','${e.id}')">Eliminar</button></td></tr>`).join('')||'<tr><td class="m">Sin eventos</td></tr>'}</table></div>
<h3 style="margin-top:22px">Anuncios (${news.length})</h3><div class="tbl"><table>${news.map(n=>`<tr><td>${esc(n.title)}</td><td><button class="btn o s" onclick="edNw='${n.id}';render()">Editar</button> <button class="btn r s" onclick="del('news','${n.id}')">Eliminar</button></td></tr>`).join('')||'<tr><td class="m">Sin anuncios</td></tr>'}</table></div>
<h3 style="margin-top:22px">Miembros y roles (${ms.length})</h3><div class="tbl"><table><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Ciudad</th><th>Rol</th><th></th></tr>${ms.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${esc(u.city)}</td>
<td><select onchange="setRol('${u.id}',this.value)"><option value="miembro" ${u.rol!=='contable'?'selected':''}>Miembro</option><option value="contable" ${u.rol==='contable'?'selected':''}>Contable</option></select></td><td><button class="btn r s" onclick="delUser('${u.id}')">✕</button></td></tr>`).join('')}</table></div>
<p><button class="btn o" onclick="csvUsers()">Descargar miembros (CSV)</button></p>
<div class="note">Cuentas iniciales — Admin: <b>${CONFIG.admin.email} / ${CONFIG.admin.pass}</b> · Contable: <b>${CONFIG.contable.email} / ${CONFIG.contable.pass}</b>. Cambia las contraseñas en “Mi perfil”.</div></div></section>`}
/* ---- Acciones ---- */
async function signup(){const n=val('#rn'),e=val('#re').toLowerCase(),p=$('#rp').value;
 if(!n||!e.includes('@')||p.length<6)return done('Completa nombre, correo válido y contraseña de 6+ caracteres.');
 if(users.some(u=>u.email===e))return done('Ese correo ya está registrado.');
 const u={id:'u'+Date.now(),name:n,email:e,pass:await sha(p),phone:val('#rt'),city:val('#rc'),role:$('#rr').value,rol:'miembro',at:Date.now()};
 users.push(u);save('users',users);me=u;save('session',u.id);log('Registro','Nuevo miembro: '+n);done('¡Bienvenido al MNBC! Tu registro fue exitoso.','perfil')}
async function doLogin(){const e=val('#le').toLowerCase(),h=await sha($('#lp').value),u=users.find(x=>x.email===e&&x.pass===h);
 if(!u)return done('Correo o contraseña incorrectos.');me=u;save('session',u.id);done('','inicio')}
function logout(){me=null;save('session',null);done('','inicio')}
async function chpass(){const p=$('#np').value;if(p.length<6)return done('Mínimo 6 caracteres.');me.pass=await sha(p);save('users',users);log('Contraseña','Cambio de contraseña');done('Contraseña actualizada.')}
function reg(id){if(!me)return done('Inicia sesión para inscribirte.','login');regs.push({eid:id,uid:me.id});save('regs',regs);done('¡Inscripción confirmada!')}
function unreg(id){regs=regs.filter(r=>!(r.eid===id&&r.uid===me.id));save('regs',regs);done('Inscripción cancelada.')}
function saveEv(){if(!val('#et')||!val('#ed'))return alert('Título y fecha son requeridos');const o={title:val('#et'),date:val('#ed'),time:val('#eh'),place:val('#ep'),cap:+val('#ec')||0,desc:val('#ex')};
 if(edEv){Object.assign(events.find(x=>x.id===edEv),o);log('Evento editado',o.title)}else{events.push({id:'e'+Date.now(),...o});log('Evento creado',o.title)}edEv=null;save('events',events);done('Evento guardado.')}
function saveNw(){if(!val('#nt'))return;const o={title:val('#nt'),body:val('#nb')};
 if(edNw)Object.assign(news.find(x=>x.id===edNw),o);else news.unshift({id:'n'+Date.now(),...o});log('Anuncio guardado',o.title);edNw=null;save('news',news);done('Anuncio guardado.')}
function del(c,id){if(!confirm('¿Eliminar?'))return;if(c==='events'){events=events.filter(x=>x.id!==id);regs=regs.filter(r=>r.eid!==id);save('events',events);save('regs',regs)}else{news=news.filter(x=>x.id!==id);save('news',news)}log('Eliminado',c+' '+id);done('Eliminado.')}
function delUser(id){if(!confirm('¿Eliminar este miembro?'))return;users=users.filter(u=>u.id!==id);regs=regs.filter(r=>r.uid!==id);save('users',users);save('regs',regs);log('Miembro eliminado',id);done('Miembro eliminado.')}
function setRol(id,r){const u=users.find(x=>x.id===id);u.rol=r;save('users',users);log('Cambio de rol',u.name+' → '+r);done('Rol actualizado.')}
/* ---- Contabilidad ---- */
function addDon(){const a=+val('#da');if(!val('#dn')||a<=0)return done('Escribe tu nombre y un monto válido.');
 movs.push({id:'m'+Date.now(),tipo:'ingreso',nombre:val('#dn'),email:val('#de').toLowerCase(),monto:a,metodo:$('#dm').value,ref:val('#dr'),fecha:val('#dd'),nota:val('#dx'),estado:'pendiente',at:Date.now()});
 save('movs',movs);log('Donación recibida',val('#dn')+' '+money(a));done('¡Gracias! Tu donación quedó registrada y será verificada por contabilidad.')}
function addEgr(){const a=+val('#ga');if(!val('#gc')||a<=0)return done('Escribe concepto y monto válido.');
 movs.push({id:'m'+Date.now(),tipo:'egreso',concepto:val('#gc'),categoria:$('#gk').value,monto:a,fecha:val('#gd'),ref:val('#gr'),estado:'pendiente',at:Date.now(),creadoPor:me.name});
 save('movs',movs);log('Egreso registrado',val('#gc')+' '+money(a));done('Egreso registrado como pendiente. Debe ser verificado.')}
function verif(id,ok){const m=movs.find(x=>x.id===id);const nota=prompt(ok?'Nota de verificación (opcional):':'Motivo del rechazo:')??null;if(nota===null)return;
 if(!ok&&!nota.trim())return alert('Indica el motivo.');
 m.estado=ok?'verificado':'rechazado';m.verPor=me.name;m.verAt=Date.now();m.verNota=nota;
 if(ok&&m.tipo==='ingreso'&&!m.recibo){const n=movs.filter(x=>x.recibo).length+1;m.recibo='MNBC-'+String(n).padStart(4,'0')}
 save('movs',movs);log(ok?'Verificado':'Rechazado',(m.nombre||m.concepto)+' '+money(m.monto)+(m.recibo?' · '+m.recibo:''));done(ok?'Movimiento verificado.':'Movimiento rechazado.')}
function editMov(id){const m=movs.find(x=>x.id===id),a=prompt('Monto (RD$):',m.monto);if(a===null)return;const v=+a;if(!(v>0))return alert('Monto inválido');
 const nt=prompt('Nota:',m.nota||'');const antes=m.monto;
 m.nota=nt??m.nota;m.monto=v;
 if(v!==antes&&m.estado==='verificado'){m.estado='pendiente';m.recibo=null}
 save('movs',movs);log('Movimiento editado',(m.nombre||m.concepto)+': '+money(antes)+' → '+money(v)+(v!==antes?' (vuelve a pendiente)':''));done('Movimiento actualizado. Si cambió el monto, debe verificarse de nuevo.')}
function delMov(id){if(!confirm('¿Eliminar este movimiento?'))return;const m=movs.find(x=>x.id===id);movs=movs.filter(x=>x.id!==id);save('movs',movs);log('Movimiento eliminado',(m.nombre||m.concepto)+' '+money(m.monto));done('Eliminado.')}
/* ---- CSV ---- */
function dl(name,rows){const t='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click()}
const csvUsers=()=>dl('miembros-mnbc.csv',[['Nombre','Correo','Teléfono','Ciudad','Rol'],...users.filter(u=>!(u.admin||u.rol==='admin')).map(u=>[u.name,u.email,u.phone,u.city,u.role])]);
const csvMov=()=>dl('contabilidad-mnbc.csv',[['Fecha','Tipo','Detalle','Monto','Estado','Recibo','Referencia','Verificado por'],...movs.map(m=>[m.fecha,m.tipo,m.nombre||m.concepto,m.monto,m.estado,m.recibo||'',m.ref||'',m.verPor||''])]);
init();
