import { google } from "googleapis";

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

    const registrations = dataRows.map((row, index) => {
      const scheduleTitle = row[6] || "";
      const groupLabel = row[7] || "";

      return {
        rowId: `${row[0] || "REG"}-${index}`,
        registrationId: row[0] || "",
        personName: row[1] || "",
        personType: row[2] || "",
        floorNumber: row[3] || "",
        seatNumber: row[4] || "",
        specialNeeds: row[5] || "",
        scheduleTitle,
        scheduleId: titleToScheduleId[scheduleTitle] || "",
        groupLabel,
        groupId: groupLabelToId(groupLabel) || "",
        scheduleTime: row[8] || "",
        submittedAt: row[9] || "",
      };
    });

    return Response.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error("Admin registrations error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to load registrations.",
      },
      { status: 500 }
    );
  }
}