---
name: job
description: "ผู้ช่วยหางานส่วนตัว (my-career-ops): สแกนหางาน ประเมิน JD เทียบกับ CV ทำ CV เป็น PDF และติดตามการสมัคร ใช้เมื่อผู้ใช้วาง URL/JD งาน หรือพูดถึงการหางาน สมัครงาน หรือ CV"
argument-hint: "[scan | pipeline | pdf <NNN> | tracker | setup | <URL หรือ JD>]"
---

# /job: ตัวเลือก mode

อ่าน `AGENTS.md` และ `modes/_shared.md` ก่อนทุกครั้ง แล้วเลือก mode จาก argument:

| Argument | Mode | ไฟล์คู่มือ |
|---|---|---|
| (ว่าง) | แสดงเมนูด้านล่าง | — |
| URL หรือข้อความ JD | ประเมินงาน | `modes/evaluate.md` |
| `scan` | หางานใหม่ | `modes/scan.md` |
| `pipeline` | ประเมินงานที่ค้างอยู่ | `modes/pipeline.md` |
| `pdf <NNN>` | ทำ CV เฉพาะตำแหน่ง | `modes/pdf.md` |
| `tracker` | ดู/อัปเดตสถานะ | `modes/tracker.md` |
| `setup` | ตั้งค่าครั้งแรก | ดูหัวข้อ Setup ด้านล่าง |

ก่อนรัน mode ใดๆ (ยกเว้น setup) ให้รัน `node scripts/doctor.mjs` ถ้ามี ❌ ให้ไปทำ Setup ก่อน

## เมนู (เมื่อไม่มี argument)

```
/job <URL>       ประเมินงาน
/job scan        หางานใหม่จากบริษัทใน config/portals.yml
/job pipeline    ประเมินงานที่ค้างอยู่
/job pdf 001     ทำ CV สำหรับรายงาน #001
/job tracker     ดูสถานะการสมัคร
/job setup       ตั้งค่าครั้งแรก
```

## Setup

1. `npm install` (ถ้า doctor บอกว่ายังไม่ได้ติดตั้ง) และ `npx playwright install chromium` (ถ้าขาด Chromium)
2. `node scripts/doctor.mjs --init` คัดลอกไฟล์ตัวอย่าง
3. **cv.md:** ขอให้ผู้ใช้วาง CV หรือเล่าประสบการณ์ แล้วแปลงเป็น Markdown ตามรูปแบบ `templates/cv.example.md` ห้ามเติมข้อมูลเอง ให้ผู้ใช้ตรวจก่อนบันทึก
4. **config/profile.yml:** ถามชื่อ อีเมล ที่อยู่ ตำแหน่งเป้าหมาย เงินเดือน และรูปแบบงานที่รับได้
5. **modes/_profile.md:** ถาม North Star, archetype ที่ต้องการ, dealbreaker
6. **config/portals.yml:** ถามบริษัทที่สนใจและคำค้นตำแหน่ง แล้วรัน `node scripts/scan.mjs --dry-run` ทดสอบ
7. รัน `node scripts/doctor.mjs` อีกครั้ง ต้องได้ ✅ ทุกข้อ
