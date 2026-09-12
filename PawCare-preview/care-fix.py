from pathlib import Path
p=Path(r'C:\Users\Lenovo\PawCare-preview\dist\app.js');s=p.read_text(encoding='utf-8');s=s.replace("state.symptoms.map(esc).join('、')||'健康咨询'", "state.careMode==='purpose'?esc(state.carePurpose):(state.symptoms.map(esc).join('、')||'健康咨询')");p.write_text(s,encoding='utf-8')
p=Path(r'C:\Users\Lenovo\PawCare-preview\dist\brand.css');s=p.read_text(encoding='utf-8-sig').replace('color:#C08D A1;','');p.write_text(s,encoding='utf-8')
