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

function buildRows(record) {
  const people = [
    {
      name: record.fullName,
      type: "المسجل الرئيسي",
    },
    ...(record.companions || []).map((name) => ({
      name,
      type: "مرافق",
    })),
  ];

  const rows = [];

  Object.entries(record.schedules || {}).forEach(([scheduleId, selected]) => {
    if (!selected?.time) return;

    people.forEach((person) => {
      rows.push([
        record.id,
        person.name,
        person.type,
        record.phone,
        record.gender,
        record.floorNumber,
        record.seatNumber,
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

export async function POST(request) {
  try {
    const record = await request.json();

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !privateKey ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      return Response.json(
        { success: false, error: "Google Sheets environment variables missing." },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const rows = buildRows(record);

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: "No rows to save." },
        { status: 400 }
      );
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Registrations!A:L",
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