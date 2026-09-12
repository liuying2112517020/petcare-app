from pathlib import Path
p=Path(r'C:\Users\Lenovo\PawCare-preview\dist\app.js')
s=p.read_text(encoding='utf-8-sig')
s=s.replace("const hospitalPhoto=(h,cls='')=>crop(2,h.x,h.y,h.w,h.h,cls,h.name+'医院实景');", "const hospitalPhoto=(h,cls='')=>h.id===1?crop(4,.047,.093,.31,.138,cls,h.name+'医院实景'):crop(2,h.x,h.y,h.w,h.h,cls,h.name+'医院实景');")
s=s.replace("if(a==='save-archive'){state.archived=true;render();toast('已加入豆豆的医疗档案');}","if(a==='save-archive'){if(!state.archived)state.extraRecords.unshift({date:'2025.08.14',type:'就诊',name:'急性胃肠炎',hospital:'瑞鹏宠物医院',doctor:'李医生 · 猫科',tags:['食欲下降','偶有呕吐','口服药物'],result:'已制定口服药物与肠胃护理方案。',visit:true});state.archived=true;render();toast('已加入豆豆的医疗档案');}")
s=s.replace("const rec=[...state.extraRecords,...baseRecords][+b.dataset.timeline];modal", "const rec=[...state.extraRecords,...baseRecords][+b.dataset.timeline];if(rec.visit){go('visit');return;}modal")
start=s.index('<div class="dose-row completed">')
end=s.index('</article>`).join',start)
s=s[:start]+ '${doseRows(m)}'+s[end:]
pos=s.index('function renderMedication()')
s=s[:pos]+'''function timesFor(m){return m.frequency.includes('3')?['08:00','14:00','20:00']:m.frequency.includes('1')?['20:00']:['08:00','20:00'];}
function logFor(m){if(!m.logs)m.logs=Object.fromEntries(timesFor(m).map(t=>[t,t==='08:00'&&m.day>0]));return m.logs;}
function doseRows(m){const logs=logFor(m);return timesFor(m).map(t=>`<div class="dose-row ${logs[t]?'completed':''}">${I(logs[t]?'check':'clock')}<div><b>${t}</b><span>${logs[t]?'已服用':'待服用'}</span></div><button class="dose-btn" data-taken="${m.id}" data-dose="${t}">${logs[t]?'撤销':'已服用'}</button>${!logs[t]?`<button class="dose-remind" data-remind="${m.id}" data-dose="${t}">${m.reminders?.[t]?'已设提醒':'提醒我'}</button>`:''}</div>`).join('');}
''' +s[pos:]
s=s.replace("m.taken=!m.taken;const top=scroll.scrollTop;render();scroll.scrollTop=top;toast(m.taken?'已记录 20:00 用药':'已撤销本次记录');", "const t=b.dataset.dose,logs=logFor(m);logs[t]=!logs[t];m.taken=timesFor(m).every(t=>logs[t]);const top=scroll.scrollTop;render();scroll.scrollTop=top;toast(logs[t]?'已记录 '+t+' 用药':'已撤销本次记录');")
s=s.replace("m.remind=!m.remind;const top=scroll.scrollTop;render();scroll.scrollTop=top;toast(m.remind?'已设置原型内 20:00 提醒':'已取消提醒');", "const t=b.dataset.dose;m.reminders=m.reminders||{};m.reminders[t]=!m.reminders[t];const top=scroll.scrollTop;render();scroll.scrollTop=top;toast(m.reminders[t]?'已设置原型内 '+t+' 提醒':'已取消提醒');")
s=s.replace("'晚间还有 '+state.meds.filter(m=>!m.taken).length+' 项用药待完成'", "'今天还有 '+state.meds.reduce((n,m)=>n+timesFor(m).filter(t=>!logFor(m)[t]).length,0)+' 项用药待完成'")
s=s.replace("symptoms:[],duration", "symptoms:[],duration")
s=s.replace("function go(route,back=false){if(sheet.open)","function go(route,back=false){$('#toast').classList.remove('show');if(sheet.open)")
p.write_text(s,encoding='utf-8')
