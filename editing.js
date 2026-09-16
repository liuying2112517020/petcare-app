/* Editing surfaces: temporary sheets and grouped, persistent profile pages. */
let lightEditor=null;
const editPhone=document.querySelector('.phone');
const serializeEdit=f=>JSON.stringify([...new FormData(f).entries()]);
function closeLightEditor(){
 if(!lightEditor)return;
 const {node,locks,focus}=lightEditor;lightEditor=null;
 locks.forEach(([el,inert])=>el.inert=inert);editPhone.classList.remove('editing-light');
 node.classList.add('leaving');node.inert=true;node.setAttribute('aria-hidden','true');node.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));setTimeout(()=>node.remove(),200);
 if(focus?.isConnected)focus.focus({preventScroll:true});
}
function openLightEditor(title,html,onSave){
 closeLightEditor();
 const node=document.createElement('div');node.className='light-editor-overlay';
 node.innerHTML=`<section class="light-editor-panel" role="dialog" aria-modal="true" aria-labelledby="light-title" tabindex="-1"><div class="light-drag" aria-hidden="true"></div><header class="light-head"><h2 id="light-title">${esc(title)}</h2><button type="button" data-light-close aria-label="关闭">×</button></header><div id="light-editor-body">${html}</div><footer class="light-footer"></footer></section>`;
 const focus=document.activeElement,locks=[...editPhone.children].filter(el=>el!==node&&!el.classList.contains('light-editor-overlay')).map(el=>[el,el.inert]);
 locks.forEach(([el])=>el.inert=true);editPhone.append(node);editPhone.classList.add('editing-light');lightEditor={node,locks,focus};
 const form=node.querySelector('form');
 if(form){form.id=form.id||'light-value-form';const old=form.querySelector('button[type=submit]');const label=old?.textContent||'保存';if(old)old.hidden=true;node.querySelector('.light-footer').innerHTML=`<button class="cta" type="submit" form="${form.id}">${esc(label)}</button>`;if(onSave)form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();onSave(new FormData(form));},true);}
 else node.querySelector('.light-footer').hidden=true;
 node.addEventListener('click',e=>{if(e.target===node||e.target.closest('[data-light-close]'))closeLightEditor();});
 node.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeLightEditor();}if(e.key==='Tab'){const items=[...node.querySelectorAll('button,input,select,textarea,[tabindex]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 let start;node.querySelector('.light-drag').addEventListener('pointerdown',e=>{start=e.clientY;e.target.setPointerCapture(e.pointerId);});node.querySelector('.light-drag').addEventListener('pointerup',e=>{if(e.clientY-start>65)closeLightEditor();});
 node.querySelector('.light-editor-panel').focus({preventScroll:true});
}
const sheetCloseBeforeEditors=sheet.close;
sheet.close=function(){if(lightEditor)closeLightEditor();else{sheetCloseBeforeEditors();sheet.classList.remove('core-editor');sheet.querySelector('.core-save')?.remove();}};
const modalBeforeEditors=modal;
modal=function(name,html){
 const t=document.createElement('template');t.innerHTML=html;const f=t.content.querySelector('form');
 if(['review-form','edit-med-schedule','visit-plan-form','care-purpose-form'].includes(f?.id)){openLightEditor(name,html);return;}
 if(['选择就诊医院','选择本次就医的宠物'].includes(name)){openLightEditor(name,html);return;}
 if(lightEditor)closeLightEditor();
 modalBeforeEditors(name,html);decorateCoreEditor();
 if(['血常规','腹部超声','生化检查'].includes(name))$('#sheet-body').insertAdjacentHTML('beforeend',`<button class="edit-text-link" data-report-note="${esc(name)}">补充检查结果</button><p class="saved-report-note">${esc(currentPet().reportNotes?.[name]||'')}</p>`);
};
function decorateCoreEditor(){
 const f=sheet.querySelector('form');const core=!!f&&['pet-form','account-form','record-form','med-form','voice-visit-form','quick-visit-form'].includes(f.id);
 sheet.classList.toggle('core-editor',core);sheet.querySelector('.core-save')?.remove();if(!core)return;
 f.classList.add('grouped-edit-form');f.dataset.baseline=serializeEdit(f);
 sheet.querySelector('.sheet-head').insertAdjacentHTML('beforeend',`<button class="core-save" type="submit" form="${f.id}">保存</button>`);
}
function coreDirty(){const f=sheet.open&&sheet.querySelector('.grouped-edit-form');return f&&serializeEdit(f)!==f.dataset.baseline?f:null;}
function confirmCoreExit(action){
 const f=coreDirty();if(!f){action();return;}
 openLightEditor('是否保存修改？','<p class="exit-question">资料尚未保存。</p><div class="exit-actions"><button class="cta" data-exit-save>保存并离开</button><button class="outline-btn" data-exit-discard>不保存，离开</button><button class="edit-text-link" data-light-close>继续编辑</button></div>');
 lightEditor.node.querySelector('[data-exit-discard]').onclick=()=>{closeLightEditor();f.dataset.baseline=serializeEdit(f);action();};
 lightEditor.node.querySelector('[data-exit-save]').onclick=()=>{closeLightEditor();if(!f.reportValidity())return;f.requestSubmit();if(!coreDirty())action();};
}
function guardCoreEditExit(e,b){if(!coreDirty())return false;e.preventDefault();e.stopImmediatePropagation();confirmCoreExit(()=>b.click());return true;}
const backBeforeEditors=backSubpage;
backSubpage=function(){confirmCoreExit(()=>{backBeforeEditors();decorateCoreEditor();});};
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&lightEditor){e.preventDefault();e.stopImmediatePropagation();closeLightEditor();}},true);
window.addEventListener('beforeunload',e=>{if(coreDirty()){e.preventDefault();e.returnValue='';}});
function editRow(label,name,value,type='text',extra=''){return `<label class="edit-row"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value??'')}" ${extra}></label>`;}
function editSelect(label,name,value,options){return `<label class="edit-row"><span>${label}</span><select name="${name}" data-core-select>${options.map(v=>{const [key,text]=Array.isArray(v)?v:[v,v];return `<option value="${esc(key)}" ${key===value?'selected':''}>${esc(text)}</option>`;}).join('')}</select>${I('chevron')}</label>`;}
function editGroup(name,body){return `<fieldset class="edit-group"><legend>${name}</legend>${body}</fieldset>`;}
petForm=function(isNew=false){const p=isNew?{name:'',breed:'边境牧羊犬',species:'狗',sex:'未知',neutered:'未知',photo:'dog',years:0,months:0}:currentPet();modal(isNew?'新增宠物':'编辑宠物资料',`<form id="pet-form" class="entry-form" data-new="${isNew}">${editGroup('宠物头像',`<div class="edit-avatar">${avatar(p)}${editSelect('档案照片','photo',p.photo,[['cat','布偶猫照片'],['dog','边牧照片'],['none','默认头像']])}</div>`)}${editGroup('基础信息',editRow('姓名','name',p.name,'text','required maxlength="16"')+editSelect('类型','species',p.species,['猫','狗'])+editRow('品种','breed',p.breed,'text','required maxlength="30"')+editSelect('性别','sex',p.sex,['公','母','未知'])+editRow('出生日期','birthdate',p.birthdate,'date','data-core-date')+editRow('年龄（岁）','years',p.years,'number','min="0" max="40" required')+editRow('月龄','months',p.months,'number','min="0" max="11" required'))}${editGroup('健康信息',editRow('体重（kg）','weight',p.weight,'number','min="0.1" max="120" step="0.1" required')+editSelect('绝育状态','neutered',p.neutered,['已绝育','未绝育','未知'])+editRow('过敏史','allergies',p.allergies,'text','maxlength="200" placeholder="未填写"')+editRow('既往病史','medicalHistory',p.medicalHistory,'text','maxlength="300" placeholder="未填写"'))}${editGroup('其他信息',`<label class="edit-row multiline"><span>备注</span><textarea name="notes" maxlength="300" placeholder="照护习惯或偏好">${esc(p.notes||'')}</textarea></label>`)}</form>`);};
accountEdit=function(){const a=accountData();modal('编辑个人资料',`<form id="account-form" class="entry-form">${editGroup('基础信息',editRow('昵称','name',a.name,'text','required maxlength="20"')+editRow('所在城市','city',a.city,'text','maxlength="40"'))}${editGroup('联系方式',editRow('联系电话','phone',a.phone,'tel','maxlength="25"'))}${editGroup('其他信息',`<label class="edit-row multiline"><span>个人简介</span><textarea name="bio" maxlength="200">${esc(a.bio||'')}</textarea></label>`)}</form>`);};
function openCorePicker(el){const title=el.closest('label').querySelector('span')?.textContent||'选择';if(el.tagName==='SELECT'){openLightEditor(title,`<form id="core-picker"><div class="picker-options">${[...el.options].map(o=>`<label><input type="radio" name="value" value="${esc(o.value)}" ${o.selected?'checked':''}><span>${esc(o.textContent)}</span></label>`).join('')}</div></form>`,d=>{el.value=d.get('value');el.dispatchEvent(new Event('change',{bubbles:true}));closeLightEditor();});}else{openLightEditor(title,`<form id="core-picker" class="entry-form"><label>${title}<input type="date" name="value" value="${esc(el.value)}" max="${new Date().toISOString().slice(0,10)}"></label></form>`,d=>{el.value=d.get('value');if(el.value){const born=new Date(el.value),now=new Date();let months=(now.getFullYear()-born.getFullYear())*12+now.getMonth()-born.getMonth()-(now.getDate()<born.getDate()?1:0);months=Math.max(0,months);el.form.elements.years.value=Math.floor(months/12);el.form.elements.months.value=months%12;}el.dispatchEvent(new Event('change',{bubbles:true}));closeLightEditor();});}}
window.addEventListener('click',e=>{const el=e.target.closest('.core-editor [data-core-select],.core-editor [data-core-date]');if(el){e.preventDefault();e.stopImmediatePropagation();openCorePicker(el);}const leave=e.target.closest('.core-editor [data-account],.core-editor [data-route]');if(leave&&coreDirty()){e.preventDefault();e.stopImmediatePropagation();confirmCoreExit(()=>leave.click());}},true);
window.addEventListener('keydown',e=>{const el=e.target.closest?.('.core-editor [data-core-select],.core-editor [data-core-date]');if(el&&['Enter',' ','ArrowDown'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();openCorePicker(el);}},true);
// Preserve original account save semantics without retaining a stale edit page in history.
window.addEventListener('submit',e=>{if(e.target.id!=='account-form')return;e.preventDefault();e.stopImmediatePropagation();const f=e.target,d=Object.fromEntries(new FormData(f));if(!d.name.trim())return;saveAccount({...accountData(),...d,name:d.name.trim()});f.dataset.baseline=serializeEdit(f);sheet.close();openAccount();toast('个人资料已保存');},true);
function editShort(title,value,suggestions,save){openLightEditor(title,`<form id="short-edit-form" class="entry-form"><div class="quick-edit-tags">${suggestions.map(s=>`<button type="button" data-quick-text="${esc(s)}">${esc(s)}</button>`).join('')}</div><label>${title}<textarea name="value" maxlength="500" placeholder="填写${title}">${esc(value||'')}</textarea></label></form>`,d=>{save(d.get('value').trim());savePets();const top=scroll.scrollTop;closeLightEditor();render();scroll.scrollTop=top;toast('已保存');});lightEditor.node.querySelectorAll('[data-quick-text]').forEach(b=>b.onclick=()=>{const t=lightEditor.node.querySelector('textarea');const values=t.value.split('、').filter(Boolean);const i=values.indexOf(b.dataset.quickText);if(i>=0)values.splice(i,1);else values.push(b.dataset.quickText);t.value=values.join('、');b.classList.toggle('selected',i<0);});}
const medEditKeys=['reason','diagnosis','treatment','advice'];
function medicalEditValue(i){const r=visitHospitalRecord();return r?r.voiceDetails[medEditKeys[i]]:(currentPet().visitEdits?.[medEditKeys[i]]??medicalCards[i][1]);}
function editMedical(i){editShort(medicalCards[i][0],medicalEditValue(i),i===0?['食欲下降','呕吐','精神稍差']:i===3?['观察饮食','按时用药','及时复诊']:[],v=>{const r=visitHospitalRecord();if(r){r.voiceDetails[medEditKeys[i]]=v;if(i===1)r.name=v;if(i===3)r.result=v;}else{currentPet().visitEdits||={};currentPet().visitEdits[medEditKeys[i]]=v;}});}
window.addEventListener('click',e=>{const b=e.target.closest('[data-medical],[data-short-edit],[data-report-note]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.hasAttribute('data-medical')){editMedical(+b.dataset.medical);return;}if(b.hasAttribute('data-report-note')){const key=b.dataset.reportNote;editShort('检查结果补充',currentPet().reportNotes?.[key],[],v=>{currentPet().reportNotes||={};currentPet().reportNotes[key]=v;const p=sheet.querySelector('.saved-report-note');if(p)p.textContent=v;});return;}if(b.dataset.shortEdit==='symptom')editShort('症状补充',currentPet().symptomNote,['偶发','饭后出现','活动后出现'],v=>currentPet().symptomNote=v);if(b.dataset.shortEdit==='med'){const m=state.meds.find(m=>m.id===+b.dataset.id);editShort('用药备注',m.notes,['随餐服用','饭后服用','观察反应'],v=>m.notes=v);}},true);
const renderBeforeEditors=render;
render=function(){renderBeforeEditors();if(state.route==='visit'){scroll.querySelectorAll('[data-medical]').forEach(b=>{const p=b.querySelector('p');if(p)p.textContent=medicalEditValue(+b.dataset.medical);});if(visitHospitalRecord())scroll.querySelectorAll('section.section-block').forEach(s=>{const i=medicalCards.findIndex(c=>c[0]===s.querySelector('h2')?.textContent);if(i>=0)s.insertAdjacentHTML('beforeend',`<button class="edit-text-link" data-medical="${i}">编辑</button>`);});}if(state.route==='symptom')scroll.insertAdjacentHTML('beforeend',`<button class="supplement-row" data-short-edit="symptom"><span>症状补充</span><small>${esc(currentPet().symptomNote||'添加补充')}</small>${I('chevron')}</button>`);if(state.route==='medication'&&state.medTab==='当前用药')scroll.querySelectorAll('.med-card').forEach((c,i)=>{const m=state.meds[i];if(m)c.insertAdjacentHTML('beforeend',`<button class="supplement-row" data-short-edit="med" data-id="${m.id}"><span>用药备注</span><small>${esc(m.notes||'添加备注')}</small>${I('chevron')}</button>`);});if(lightEditor){editPhone.classList.add('editing-light');[...editPhone.children].filter(el=>el!==lightEditor.node).forEach(el=>el.inert=true);}};
render();
// Follow-up details are a temporary edit, while medical history stays in the profile.
reviewModal=function(){modal('复诊计划',`<form id="review-form" class="entry-form"><label>复诊日期<input type="date" name="date" value="${esc(state.review||'')}" required></label><label>提醒时间<input type="time" name="time" value="${esc(state.reviewTime||'10:00')}" required></label><div class="quick-edit-tags">${['携带检查报告','复查用药效果','空腹检查'].map(t=>`<button type="button" data-review-tag="${t}">${t}</button>`).join('')}</div><label>计划备注<textarea name="reviewNote" maxlength="300" placeholder="复诊时需要留意的事项">${esc(currentPet().reviewNote||'')}</textarea></label><button type="submit" class="cta">保存</button></form>`);lightEditor.node.querySelectorAll('[data-review-tag]').forEach(b=>b.onclick=()=>{const t=lightEditor.node.querySelector('textarea');const values=t.value.split('、').filter(Boolean);const i=values.indexOf(b.dataset.reviewTag);if(i<0)values.push(b.dataset.reviewTag);else values.splice(i,1);t.value=values.join('、');b.classList.toggle('selected',i<0);});};
window.addEventListener('submit',e=>{if(e.target.id==='review-form'){currentPet().reviewNote=new FormData(e.target).get('reviewNote')||'';queueMicrotask(savePets);}},true);
// Selection sheets commit only after Save, so an accidental tap can be cancelled.
const modalBeforeSelectionEditors=modal;
modal=function(name,html){
 if(name==='选择就诊医院'||name==='选择本次就医的宠物'){
 const isHospital=name==='选择就诊医院';const choices=isHospital?hospitals:petStore.pets;
 const selected=isHospital?choices.find(h=>selectedVisitHospital().includes(h.name))?.id:currentPet().id;
 openLightEditor(name,`<form id="single-choice-editor"><div class="picker-options image-options">${choices.map(c=>`<label><input name="value" type="radio" value="${esc(c.id)}" ${String(c.id)===String(selected)?'checked':''} required>${isHospital?hospitalPhoto(c):avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(isHospital?c.branch:c.breed)}</small></span></label>`).join('')}</div></form>`,d=>{const id=d.get('value');closeLightEditor();if(isHospital){const h=hospitals.find(h=>String(h.id)===id),r=visitHospitalRecord(),name=h.name+' · '+h.branch;if(r){r.hospital=name;r.voiceDetails.hospital=name;r.doctor='医生待补充';}else currentPet().visitHospital=name;savePets();render();}else{switchPet(id);savePets();}toast('已更新');});return;
 }
 modalBeforeSelectionEditors(name,html);
};
