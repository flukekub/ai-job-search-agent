// ด่านกันการแต่งข้อมูล: ตรวจว่าเนื้อหา CV ที่ AI ปรับมาแล้ว ยังสืบกลับไปหา cv.md ได้
//   errors   = บริษัท/สถาบันที่ไม่มีใน cv.md (ต้องแก้ก่อนสร้าง PDF)
//   warnings = ตัวเลขที่ไม่มีใน cv.md (อาจถูกต้องถ้าเขียนรูปแบบต่างกัน แต่ต้องตรวจด้วยตา)

const squash = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ');

// ตัวเลขที่ "มีความหมาย" เช่น 40%, $2M, 1,200, 3.5x (ไม่นับเลขปีช่วงวันที่)
const NUMBER_RE = /[$฿€£]?\d[\d,]*(?:\.\d+)?\s*(?:%|x|k|m|b|\+)?/gi;

function numbersIn(text) {
  return (String(text ?? '').match(NUMBER_RE) ?? [])
    .map((n) => n.trim().toLowerCase().replace(/\s+/g, ''))
    .filter((n) => n.replace(/[^\d]/g, '').length > 0);
}

export function checkFacts(payload, cvText) {
  const cv = squash(cvText);
  const cvCompact = cv.replace(/[\s,]/g, '');
  const errors = [];
  const warnings = [];

  for (const job of payload.experience ?? []) {
    if (job.company && !cv.includes(squash(job.company))) {
      errors.push(`บริษัท "${job.company}" ไม่มีใน cv.md`);
    }
  }
  for (const edu of payload.education ?? []) {
    if (edu.school && !cv.includes(squash(edu.school))) {
      errors.push(`สถาบัน "${edu.school}" ไม่มีใน cv.md`);
    }
  }

  const texts = [
    payload.summary,
    ...(payload.experience ?? []).flatMap((job) => job.bullets ?? []),
    ...(payload.projects ?? []).flatMap((p) => [p.description, ...(p.bullets ?? [])]),
  ];
  for (const text of texts) {
    for (const n of numbersIn(text)) {
      if (!cvCompact.includes(n.replace(/,/g, ''))) {
        warnings.push(`ตัวเลข "${n}" ใน "${String(text).slice(0, 60)}..." ไม่พบใน cv.md`);
      }
    }
  }
  return { errors, warnings };
}
