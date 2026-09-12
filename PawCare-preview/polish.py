from pathlib import Path
p=Path(r'C:\Users\Lenovo\PawCare-preview\dist\app.js');s=p.read_text(encoding='utf-8');s=s.replace('.689,.218,.106', '.689,.218,.065')
s=s.replace("${crop(6,.056,i===0?.322:.591,.155,.062,'drug-photo','参考药品图片，仅作示意')}","${i<2?crop(6,.056,i===0?.322:.591,.155,.062,'drug-photo','参考药品图片，仅作示意'):'<span class=\"soft-icon\">'+I('pill')+'</span>'}")
s=s.replace('<article><h2>${esc(r.name)}</h2>', '<article class="${r.name===\'皮肤炎（疑似过敏）\'||r.name===\'年度体检\'?\'has-thumbnail\':\'\'}">${r.name===\'皮肤炎（疑似过敏）\'?crop(5,.805,.354,.178,.097,\'timeline-thumb\',\'参考中的宠物照片\'):r.name===\'年度体检\'?crop(5,.805,.531,.178,.095,\'timeline-thumb\',\'参考中的体检报告缩略图\'):\'\'}<h2>${esc(r.name)}</h2>')
p.write_text(s,encoding='utf-8')
