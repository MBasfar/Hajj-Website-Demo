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

function getPeople(record) {
  return [
    {
      firstName: record.firstName,
      type: "المسجل الرئيسي",
      floorNumber: record.floorNumber,
      seatNumber: record.seatNumber,
    },
    ...(record.companions || []).map((companion) => ({
      firstName: companion.firstName,
      type: "مرافق",
      floorNumber: companion.floorNumber,
      seatNumber: companion.seatNumber,
    })),
  ];
}

function buildRows(record) {
  const people = getPeople(record);
  const rows = [];

  Object.entries(record.schedules || {}).forEach(([scheduleId, selected]) => {
    if (!selected?.time) return;

    people.forEach((person) => {
      rows.push([
        record.id,
        person.firstName,
        person.type,
        person.floorNumber,
        person.seatNumber,
        record.specialNeeds,
        scheduleNames[scheduleId] || scheduleId,
        selected.groupLabel,
        selected.time,
        record.submittedAt,
      ]);
    });
  });

  return rows;
}

async function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !privateKey ||
    !process.env.GOOGLE_SHEET_ID
  ) {
    throw new Error("Google Sheets environment variables missing.");
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function getCurrentUsedCounts(sheets) {
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

  return used;
}

function checkCapacity(record, usedCounts) {
  const peopleCount = getPeople(record).length;

  for (const [scheduleId, selected] of Object.entries(record.schedules || {})) {
    if (!selected?.groupId) continue;

    const key = `${scheduleId}__${selected.groupId}`;
    const currentUsed = usedCounts[key] || 0;

    if (currentUsed + peopleCount > MAX_CAPACITY) {
      return {
        ok: false,
        message: `عذرًا، لا توجد مقاعد كافية في ${scheduleNames[scheduleId]} - ${selected.groupLabel}.`,
      };
    }
  }

  return { ok: true };
}

export async function POST(request) {
  try {
    const record = await request.json();
    const sheets = await getSheetsClient();

    const usedCounts = await getCurrentUsedCounts(sheets);
    const capacityCheck = checkCapacity(record, usedCounts);

    if (!capacityCheck.ok) {
      return Response.json(
        {
          success: false,
          error: capacityCheck.message,
        },
        { status: 409 }
      );
    }

    const rows = buildRows(record);

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: "No rows to save." },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Registrations!A:J",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    return Response.json({
      success: true,
      rowsAdded: rows.length,
      maxCapacity: MAX_CAPACITY,
    });
  } catch (error) {
    console.error("Google Sheets save error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to save registration.",
      },
      { status: 500 }
    );
  }
}