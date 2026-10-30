# my-career-ops

ผู้ช่วยหางานด้วย AI ฉบับย่อของเราเอง ได้แรงบันดาลใจจาก [career-ops](https://github.com/career-ops-hq/career-ops)
ต้นฉบับมีสคริปต์ราว 300 ไฟล์ ฉบับนี้ย่อเหลือประมาณ 20 ไฟล์ อ่านเข้าใจได้ทุกบรรทัด แต่ยังทำงานครบวงจร:

**สแกนหางาน → ประเมินด้วย AI → ทำ CV เป็น PDF → ติดตามการสมัคร**

## ทำงานยังไง

```
config/portals.yml ──► scripts/scan.mjs ──► data/pipeline.md
                      (Greenhouse/Lever/Ashby API)     │
                                                       ▼
            /job pipeline หรือ /job <URL>  ──►  AI ทำตาม modes/evaluate.md
                                                       │  (fetch-jd.mjs ดึง JD + เช็กว่าประกาศยังเปิด)
                                   ┌───────────────────┴───────────────────┐
                                   ▼                                       ▼
                    reports/NNN-company-date.md            scripts/tracker.mjs add
                    (คะแนน 1–5 + รายงาน A–F + JD)           → data/applications.md
                                   │
                                   ▼
                    /job pdf NNN  ──►  AI เขียน payload JSON  ──►  scripts/build-cv.mjs
                                                                   (fact-check → HTML → PDF)
                                                                          │
                                                                          ▼
                                                     👤 เราตรวจ แล้วกดสมัครเอง
```

แบ่งเป็น 3 ส่วนแบบเดียวกับต้นฉบับ:

| ส่วน | อยู่ที่ | หน้าที่ |
|---|---|---|
| 🧠 สมอง | `modes/*.md` | ขั้นตอนที่ AI ทำตาม เช่น วิธีให้คะแนน วิธีปรับ CV |
| ✋ มือ | `scripts/*.mjs` | งานที่ไม่ต้องใช้ AI: เรียก API, แก้ตาราง, สร้าง PDF (ไม่เสีย token) |
| 💾 ความจำ | `data/`, `reports/`, `output/` | ไฟล์ข้อความธรรมดา เปิดอ่านด้วยตาได้ |

## เริ่มใช้งาน

```bash
cd ~/Documents/my-career-ops
npm install
node scripts/doctor.mjs --init      # คัดลอกไฟล์ตัวอย่าง แล้วตรวจว่ายังขาดอะไร
```

จากนั้นเปิด Claude Code ในโฟลเดอร์นี้แล้วพิมพ์ `/job setup` AI จะพาสร้าง `cv.md` และแก้ไฟล์ตั้งค่าทีละขั้น

## คำสั่ง

### ใน Claude Code

| คำสั่ง | ทำอะไร |
|---|---|
| `/job <URL หรือ JD>` | ประเมินงาน → รายงาน + ลง tracker |
| `/job scan` | หางานใหม่จากบริษัทใน `config/portals.yml` |
| `/job pipeline` | ประเมินงานที่ค้างใน pipeline |
| `/job pdf 001` | ทำ CV เฉพาะตำแหน่งจากรายงาน #001 |
| `/job tracker` | ดู/เปลี่ยนสถานะการสมัคร |

### ใน terminal (ไม่ใช้ AI)

```bash
npm run scan -- --dry-run                       # ดูผลสแกนโดยไม่เขียนไฟล์
npm run fetch-jd -- <url>                       # ดึง JD (exit 0 เปิดอยู่, 3 ปิดแล้ว, 2 ไม่รองรับ)
npm run tracker -- list                         # ดู tracker
npm run tracker -- status 3 Applied --notes "สมัครผ่านเว็บ"
npm run pipeline -- list                        # งานที่รอประเมิน
npm run pdf -- templates/cv-payload.example.json   # ลองสร้าง PDF จากตัวอย่าง
npm test                                        # ชุดทดสอบ
```

## โครงสร้าง

```
my-career-ops/
├── AGENTS.md / CLAUDE.md        กฎใหญ่ที่ AI อ่านทุกครั้ง
├── .claude/skills/job/SKILL.md  ตัวเลือก mode ของคำสั่ง /job
├── modes/
│   ├── _shared.md               ระบบคะแนน + กติกากลาง
│   ├── _profile.template.md     แม่แบบเป้าหมายอาชีพ → คัดลอกเป็น _profile.md
│   ├── evaluate.md              ขั้นตอนประเมินงาน + แม่แบบรายงาน
│   ├── scan.md / pipeline.md / pdf.md / tracker.md
├── scripts/
│   ├── scan.mjs                 สแกนบอร์ดงาน
│   ├── fetch-jd.mjs             ดึง JD + เช็กว่าประกาศยังเปิด
│   ├── tracker.mjs              จัดการ data/applications.md
│   ├── pipeline.mjs             จัดการ data/pipeline.md
│   ├── build-cv.mjs             JSON → HTML → PDF
│   ├── doctor.mjs               ตรวจการตั้งค่า
│   ├── providers/               ตัวเชื่อม ATS: greenhouse, lever, ashby
│   └── lib/                     ฟังก์ชันใช้ร่วม (มีเทสต์ครอบ)
├── templates/                   แม่แบบ CV (HTML), ตัวอย่าง cv.md และ payload
├── config/                      *.example.yml → คัดลอกเป็นไฟล์จริง
├── tests/                       node:test
└── data/ reports/ output/       ข้อมูลส่วนตัว (ไม่ถูก commit)
```

## กฎสำคัญ

1. **ห้ามแต่งข้อมูล** CV ที่ AI ปรับมาต้องสืบกลับไปหา `cv.md` ได้ `build-cv.mjs` จะหยุดสร้าง PDF ถ้าเจอบริษัทที่ไม่มีใน cv.md และจะเตือนเมื่อเจอตัวเลขที่ไม่มีใน cv.md
2. **ไม่ส่งใบสมัครแทนเรา** ระบบเตรียมเอกสารให้ แต่เราเป็นคนกดส่งเอง
3. **คะแนนต่ำกว่า 4.0 = ไม่แนะนำให้สมัคร**
4. **แก้ tracker และ pipeline ผ่านสคริปต์เท่านั้น** เพื่อกันข้อมูลซ้ำและสถานะเพี้ยน

## ขยายต่อ

- **เพิ่มแหล่งงาน:** สร้าง `scripts/providers/xxx.mjs` ที่มี `{ id, detect(url), list(slug), getJob(slug, id) }` แล้วเพิ่มลงใน `providers/index.mjs` (ดู `ashby.mjs` เป็นตัวอย่างที่สั้นที่สุด)
- **เพิ่ม mode:** เขียน `modes/xxx.md` แล้วเพิ่มแถวในตารางของ `.claude/skills/job/SKILL.md`
- **เปลี่ยนหน้าตา CV:** แก้ `templates/cv.html` (CSS อยู่ในไฟล์เดียวกัน)

## สิ่งที่ตัดออกจากต้นฉบับ (และข้อจำกัด)

| ต้นฉบับมี | ฉบับนี้ |
|---|---|
| ~140 providers | 3 ตัว (Greenhouse, Lever, Ashby) ครอบคลุมบริษัท tech ส่วนใหญ่ |
| Batch หลาย worker พร้อมกัน + จองเลขรายงานแบบ atomic | ประเมินทีละงาน เลขรายงานใช้ max+1 จึงห้ามรันหลาย session พร้อมกัน |
| เช็กประกาศด้วย Playwright เมื่อ API ไม่รองรับ | ให้ AI เปิดหน้าเว็บเอง หรือขอให้ผู้ใช้วาง JD |
| Fact-check หลายชั้น + ATS score | Fact-check แบบง่าย (ชื่อบริษัท/สถาบัน + ตัวเลข) |
| Follow-up, interview prep, analytics, dashboard | ยังไม่มี (เพิ่มเป็น mode ใหม่ได้) |

หมายเหตุ: บอร์ด Lever ที่มีงานหลายร้อยตำแหน่ง (เช่น Palantir) อาจส่งข้อมูลช้ามากจนเกิน timeout 120 วินาที
