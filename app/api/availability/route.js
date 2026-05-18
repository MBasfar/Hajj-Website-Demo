import { google } from "googleapis";

const MAX_CAPACITY = 188;

const scheduleNames = {
  mina_to_arafat: "مسار عملية التصعيد من منى إلى عرفات",
  arafat_to_muzdalifah: "عملية الإفاضة من عرفات إلى مزدلفة",
  muzdalifah_to_mina: "عملية الإفاضة من مزدلفة إلى منى",
  second_jamarat: "رمي الجمرات - الرمية الثانية",
  third_jamarat: "رمي الجمرات - الرمية الثالثة",
  fourth_jamarat: "رمي الجمرات - الرمية الرابعة",
};

const titleToScheduleId = Object.fromEntries(
  Object.entries(scheduleNames).map(([id, title]) => [title, id])
);

const groupLabels = [
  "الفوج الأول",
  "الفوج الثاني",
  "الفوج الثالث",
  "الفوج الرابع",
  "الفوج الخامس",
  "الفوج السادس",
  "الفوج السابع",
  "الفوج الثامن",
  "الفوج التاسع",
];

function groupLabelToId(label) {
  const index = groupLabels.indexOf(label);
  return index === -1 ? null : `fawj_${index + 1}`;
}

async function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET() {
  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Registrations!A:J",
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    const used = {};

    dataRows.forEach((row) => {
      const scheduleTitle = row[6];
      const groupLabel = row[7];

      const scheduleId = titleToScheduleId[scheduleTitle];
      const groupId = groupLabelToId(groupLabel);

      if (!scheduleId || !groupId) return;

      const key = `${scheduleId}__${groupId}`;
      used[key] = (used[key] || 0) + 1;
    });

    const remaining = {};

    Object.entries(used).forEach(([key, count]) => {
      remaining[key] = Math.max(0, MAX_CAPACITY - count);
    });

    return Response.json({
      success: true,
      used,
      remaining,
      maxCapacity: MAX_CAPACITY,
    });
  } catch (error) {
    console.error("Availability error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to load availability.",
      },
      { status: 500 }
    );
  }
}