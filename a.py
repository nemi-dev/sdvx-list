import os
from os.path import isfile
import csv
from operator import itemgetter

def unlink(p):
  if isfile(p):
    os.unlink(p)
    print(f"{p} deleted")

with open("./joined.tsv", encoding="UTF-8", newline="") as f:
  j = [*csv.DictReader(f, delimiter="\t")]

il = [jj['ino'] for jj in j]
il = set(il)

imgs = os.listdir('./public/img')
imgs.sort()
imgs = set(map(lambda x : x[:4], imgs))


for lack in imgs - il:
  unlink(f"./public/img/{lack}-inov.jpg")
  unlink(f"./public/img/{lack}-iadv.jpg")
  unlink(f"./public/img/{lack}-iexh.jpg")
  unlink(f"./public/img/{lack}-imxm.jpg")