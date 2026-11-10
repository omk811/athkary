import json,re,unicodedata,fitz
from pathlib import Path
from PIL import Image
pdf=fitz.open("source.pdf")
if len(pdf)!=103: raise RuntimeError("Unexpected page count: "+str(len(pdf)))
Path("pages").mkdir(exist_ok=True)
def clean(s):
 s=unicodedata.normalize("NFKC",s)
 for a,b in [("ﷲ","الله"),("ࢭ","ف"),("ࡩ","ف"),("ڴ","ل"),("ڈ","ه"),("ܣ","ي"),("ۜ",""),("ۗ",""),("ۚ",""),("ۛ",""),("ٕ",""),("ٔ",""),("ٮ","ت"),("امل","الم")]:
  s=s.replace(a,b)
 s=re.sub(r"\s+"," ",s).strip()
 return s
toc=[]
for k in range(1,9):
 for b in pdf[k].get_text("blocks"):
  t=b[4]
  m=re.match(r"^\s*(\d{1,3})\s*\.\s*",t)
  if not m:continue
  id=int(m.group(1))
  if not 1<=id<=247:continue
  part=t[m.end():]; nums=re.findall(r"\d{1,3}",part)
  if not nums:continue
  p=int(nums[-1])
  title=clean(re.split(r"\.{3,}",part)[0]).strip(" .،-")
  if 10<=p<=103 and title:toc.append(dict(id=id,title=title,page=p))
toc.sort(key=lambda x:x["id"])
assert len(toc)==247 and [x["id"] for x in toc]==list(range(1,248))
for i,x in enumerate(toc):
 nextpage=toc[i+1]["page"] if i+1<len(toc) else 102
 x["end"]=min(103,max(x["page"],nextpage if nextpage==x["page"] else nextpage-1))
 n=x["id"]
 x["category"]=("day" if n<=3 else "sleep" if n<=14 else "daily" if n<=23 else "prayer" if n<=69 else "worship" if n<=93 else "nature" if n<=107 else "manners" if n<=160 else "daily" if n<=178 else "hardship" if n<=199 else "bereavement" if n<=208 else "travel" if n<=223 else "hajj" if n<=240 else "general")
toc=[dict(id=0,title="المقدمة والتعريف بالكتاب",page=1,end=11,category="general")]+toc+[dict(id=248,title="فهرس المراجع",page=102,end=103,category="general")]
Path("catalog.json").write_text(json.dumps(toc,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
for i,page in enumerate(pdf):
 pix=page.get_pixmap(matrix=fitz.Matrix(1.6,1.6),alpha=False)
 Image.frombytes("RGB",(pix.width,pix.height),pix.samples).save("pages/%03d.webp"%(i+1),"WEBP",quality=81,method=5)
print("Generated",len(toc),"catalog entries and",len(pdf),"page images")
