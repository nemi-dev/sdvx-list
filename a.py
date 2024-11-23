import csv
from operator import itemgetter

with open("./public/list.tsv", encoding="utf-8", newline="") as r:
  l = [*csv.DictReader(r, delimiter="\t")]

with open("./jack2.tsv", encoding="utf-8", newline="") as r:
  j = [*csv.DictReader(r, delimiter="\t")]

k = []

for litem in l:
  found = False
  for jitem in j:
    if litem['title'].strip() == jitem['title'].strip():
      if jitem['ino'] == '0867': continue
      kitem = {
        **litem,
        "ino": jitem["ino"],
        "title": litem['title'].strip()
      }
      k.append(kitem)
      found = True
  
  if not found:
    k.append({ **litem, "ino": ""})

headers = ['ino', 'no', 'title', 'artist', 'bpm', 'slow', 'nov', 'adv', 'exh', 'mxm', 'unov', 'uadv', 'uexh', 'umxm', 'from', 'at', 'etc']

# k.sort(key = itemgetter("no"))
with open("./joined.tsv", "w", encoding="UTF-8", newline="") as w:
  writer = csv.DictWriter(w, headers, delimiter="\t")
  writer.writeheader()
  writer.writerows(k)
