from pathlib import Path
p=Path(r'C:\Users\Lenovo\PawCare-preview\dist\app.js');s=p.read_text(encoding='utf-8')
pos=s.index('const state=')
s=s[:pos]+'''const PET_KEY='pawcare-pets-v1';
let petStore;try{petStore=JSON.parse(localStorage.getItem(PET_KEY));}catch{}
if(!petStore?.pets?.length)petStore={active:'doudou',pets:[{id:'doudou',name:'豆豆',species:'猫',breed:'布偶猫',years:3,months:2,sex:'公',neutered:'已绝育',weight:5.2,notes:'喜欢安静的环境，就诊时请轻声安抚。',photo:'cat'},{id:'kele',name:'可乐',species:'狗',breed:'边境牧羊犬',years:2,months:0,sex:'公',neutered:'未绝育',weight:18.5,notes:'精力充沛，外出就诊时记得带牵引绳。',photo:'dog'}],data:{}};
function currentPet(){return petStore.pets.find(p=>p.id===petStore.active)||petStore.pets[0];}
const petAge=p=>`${p.years}岁${+p.months?p.months+'个月':''}`;
const petFields=['symptoms','duration','appetite','energy','compare','archived','review','reviewTime','remind','booked','extraRecords','meds'];
function savePets(){try{petStore.data[petStore.active]=Object.fromEntries(petFields.map(k=>[k,state[k]]));localStorage.setItem(PET_KEY,JSON.stringify(petStore));}catch{}}
function switchPet(id){if(!petStore.pets.some(p=>p.id===id))return;savePets();petStore.active=id;Object.assign(state,petStore.data[id]||{symptoms:[],duration:'',appetite:'',energy:'',compare:[],archived:false,review:'',reviewTime:'10:00',remind:false,booked:false,extraRecords:[],meds:[]});state.archiveTab='时间轴';state.medTab='当前用药';render();}
''' +s[pos:]
s=s.replace("const avatar=()=>`<div class=\"avatar cat-avatar\" role=\"img\" aria-label=\"布偶猫豆豆\"></div>`;", "const avatar=(p=currentPet())=>`<div class=\"avatar ${p.photo==='dog'?'dog-avatar':p.photo==='cat'?'cat-avatar':'plain-avatar'}\" role=\"img\" aria-label=\"${esc(p.breed+' '+p.name)}\">${p.photo==='none'?I('paw'):''}</div>`;")
s=s.replace("const petMini=()=>`<div class=\"pet-mini\">${avatar()}<div><b>豆豆</b><span>布偶猫 · 3岁2个月</span></div><small>5.2 kg</small></div>`;", "const petMini=()=>`<div class=\"pet-mini\">${avatar()}<div><b>${esc(currentPet().name)}</b><span>${esc(currentPet().breed)} · ${petAge(currentPet())}</span></div><small>${currentPet().weight} kg</small></div>`;")
s=s.replace('function render(){','function renderOriginal(){',1)
s=s.replace("profile:'我的'", "profile:'我的',petdetail:'宠物档案'")
s=s.replace("if(r==='profile')renderProfile();icons();", "if(r==='profile')renderProfile();if(r==='petdetail')renderPetDetail();icons();")
a=s.index('function renderProfile()');b=s.index('function voice()',a)
s=s[:a]+'''function renderProfile(){const p=currentPet();scroll.innerHTML=`<div class="owner-card"><span class="soft-icon">${I('user')}</span><div><h2>我的照护空间</h2><p>陪伴它们，也照顾好每一天</p></div></div><section class="pet-selector"><div class="section-heading"><h2>我的宠物 <small>${petStore.pets.length}只</small></h2><button data-pet-action="add">${I('plus')}添加宠物</button></div><div class="pet-carousel" aria-label="左右滑动选择宠物">${petStore.pets.map(x=>`<article class="pet-slide ${x.id===p.id?'selected':''}" data-pet-id="${x.id}"><button class="pet-card-main" data-pet-edit="${x.id}" aria-label="查看${esc(x.name)}的宠物档案">${avatar(x)}<div><h2>${esc(x.name)}</h2><p>${esc(x.breed)} · ${petAge(x)}</p><small>${x.sex} · ${x.weight} kg</small></div>${I('chevron')}</button><button class="select-pet" data-select-pet="${x.id}" ${x.id===p.id?'aria-current="true"':''}>${I(x.id===p.id?'check':'paw')}${x.id===p.id?'当前照护宠物':'切换到'+esc(x.name)}</button></article>`).join('')}</div><div class="pet-switch-hint"><span>左右滑动切换 · 点击卡片查看档案</span><div>${petStore.pets.map(x=>`<button aria-label="切换到${esc(x.name)}" data-select-pet="${x.id}" class="pet-dot ${x.id===p.id?'selected':''}"></button>`).join('')}</div></div></section><div class="profile-links"><button data-route="petdetail">${I('paw')}宠物基本档案 ${I('chevron')}</button><button data-route="archive">${I('file')}${esc(p.name)}的医疗档案 ${I('chevron')}</button><button data-route="visit">${I('record')}就诊记录 ${I('chevron')}</button><button data-route="medication">${I('pill')}用药与提醒 ${I('chevron')}</button></div><p class="microcopy centered">宠物档案保存在当前浏览器，暂不支持跨设备同步。<br>每只宠物的症状、档案和用药分别管理。</p>`;}
''' +s[b:]
s=s.replace('[...state.extraRecords,...baseRecords]','[...state.extraRecords,...(currentPet().id===\'doudou\'?baseRecords:[])]')
s=s.replace('});render();','});if(petStore.data[petStore.active])Object.assign(state,petStore.data[petStore.active]);else if(petStore.active!==\'doudou\')Object.assign(state,{meds:[],extraRecords:[],review:\'\'});render();')
p.write_text(s,encoding='utf-8')
