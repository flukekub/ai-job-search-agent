# Mode: tracker (ดูและอัปเดตสถานะการสมัคร)

- **ดูทั้งหมด:** `node scripts/tracker.mjs list` แล้วสรุปตามสถานะ (Evaluated กี่งาน, Applied กี่งาน, ...)
- **ดูเฉพาะสถานะ:** `node scripts/tracker.mjs list --status Interview`
- **เปลี่ยนสถานะ:** `node scripts/tracker.mjs status <#> <State> --notes "..."`
  สถานะที่ใช้ได้: Evaluated, Applied, Responded, Interview, Offer, Hired, Rejected, Discarded, SKIP
- **เพิ่มงานที่ผู้ใช้สมัครเองโดยไม่ได้ประเมิน:** ให้คะแนนเป็นค่าประมาณจากที่ผู้ใช้บอก แล้วระบุใน notes ว่า "ไม่ได้ประเมิน"

ข้อแนะนำ:
- งานที่ Applied เกิน 7 วันแล้วยังไม่ได้ตอบ ให้เสนอ follow-up
- ถ้าผู้ใช้เล่าผลสัมภาษณ์หรือ offer ให้เสนออัปเดตสถานะทันที
- ห้ามแก้ `data/applications.md` ด้วยมือ
