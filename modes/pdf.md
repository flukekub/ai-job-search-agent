# Mode: pdf (ทำ CV เฉพาะตำแหน่ง)

input: เลขรายงาน `NNN` หรือบริษัท

## ขั้นตอน

1. หารายงาน `reports/NNN-*.md` แล้วอ่าน Block B (Match) และ D (แผนปรับ CV)
2. อ่าน `cv.md` และ `config/profile.yml` (ใช้ทำส่วน contact)
3. เขียน payload JSON ลง `output/cv-NNN-{company-slug}.json` ตามรูปแบบใน `templates/cv-payload.example.json`
4. รัน `node scripts/build-cv.mjs output/cv-NNN-{company-slug}.json`
5. อ่านผล fact-check:
   - ❌ errors (บริษัท/สถาบันไม่มีใน cv.md): แก้ payload ให้ตรงกับ cv.md แล้วรันใหม่ ห้ามใช้ `--force` เอง
   - ⚠️ warnings (ตัวเลขไม่ตรง): ไล่ตรวจทีละข้อ ถ้าเป็นตัวเลขที่ไม่มีใน cv.md ให้ลบออก ถ้าเป็นแค่การเขียนต่างรูปแบบให้บอกผู้ใช้
6. แจ้ง path ของ PDF แล้วเตือนผู้ใช้ให้เปิดอ่านก่อนส่งเสมอ

## ปรับได้ / ห้ามทำ

| ✅ ปรับได้ | ❌ ห้ามทำ |
|---|---|
| เรียงประสบการณ์หรือ bullet ที่ตรงกับ JD ขึ้นก่อน | เพิ่มทักษะที่ไม่มีใน cv.md |
| เปลี่ยนคำให้ตรงกับคำใน JD เมื่อความหมายเดิม เช่น "built" → "designed and built" ถ้า cv.md รองรับ | เพิ่มหรือแก้ตัวเลข |
| ตัด bullet ที่ไม่เกี่ยวข้องออก | เปลี่ยนชื่อตำแหน่ง ชื่อบริษัท หรือวันที่ |
| เขียน summary ใหม่ให้เน้น archetype ของงาน | อ้างว่าสร้างเครื่องมือที่แค่เคยใช้ |
| เลือก skill ที่เกี่ยวข้องขึ้นก่อน | ใส่ keyword ที่ไม่มีหลักฐาน |

## ข้อแนะนำเรื่อง ATS

- ยาวไม่เกิน 1–2 หน้า
- ใช้หัวข้อมาตรฐาน (Summary, Experience, Skills, Education)
- bullet ขึ้นต้นด้วย action verb และเน้นผลลัพธ์ที่มีใน cv.md
