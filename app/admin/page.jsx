"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Table2, Users, Bus, RefreshCw, Lock } from "lucide-react";

const MAX_CAPACITY = 188;
const ADMIN_PASSWORD = "12345";
const AUTH_KEY = "hajj_admin_authenticated";

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

function makeSlots(times) {
  return times.map((time, index) => ({
    groupId: `fawj_${index + 1}`,
    groupLabel: groupLabels[index],
    time,
  }));
}

const scheduleSections = [
  {
    id: "mina_to_arafat",
    title: "مسار عملية التصعيد من منى إلى عرفات",
    subtitle: "يوم 9 ذو الحجة - جدول القطار B",
    slots: makeSlots([
      "02:50 صباحًا",
      "03:00 صباحًا",
      "03:10 صباحًا",
      "03:20 صباحًا",
      "05:30 صباحًا",
      "05:40 صباحًا",
      "06:30 صباحًا",
      "06:40 صباحًا",
      "06:50 صباحًا",
    ]),
  },
  {
    id: "arafat_to_muzdalifah",
    title: "عملية الإفاضة من عرفات إلى مزدلفة",
    subtitle: "يوم 9 ذو الحجة - جدول القطار C",
    slots: makeSlots([
      "07:00 مساءً",
      "07:00 مساءً",
      "07:00 مساءً",
      "07:00 مساءً",
      "07:00 مساءً",
      "07:00 مساءً",
      "07:00 مساءً",
      "07:10 مساءً",
      "07:10 مساءً",
    ]),
  },
  {
    id: "muzdalifah_to_mina",
    title: "عملية الإفاضة من مزدلفة إلى منى",
    subtitle: "يوم 10 ذو الحجة - جدول القطار D",
    slots: makeSlots([
      "01:00 صباحًا",
      "01:00 صباحًا",
      "01:10 صباحًا",
      "01:20 صباحًا",
      "01:20 صباحًا",
      "01:30 صباحًا",
      "01:30 صباحًا",
      "01:40 صباحًا",
      "01:50 صباحًا",
    ]),
  },
  {
    id: "second_jamarat",
    title: "رمي الجمرات - الرمية الثانية",
    subtitle: "يوم 11 و12 ذو الحجة",
    slots: makeSlots([
      "06:00 صباحًا",
      "06:20 صباحًا",
      "06:10 مساءً",
      "06:30 مساءً",
      "06:50 مساءً",
      "08:20 مساءً",
      "10:00 مساءً",
      "11:40 مساءً",
      "02:10 صباحًا",
    ]),
  },
  {
    id: "third_jamarat",
    title: "رمي الجمرات - الرمية الثالثة",
    subtitle: "يوم 12 و13 ذو الحجة",
    slots: makeSlots([
      "05:40 صباحًا",
      "06:40 صباحًا",
      "07:40 صباحًا",
      "08:40 صباحًا",
      "09:40 صباحًا",
      "06:00 مساءً",
      "06:20 مساءً",
      "06:40 مساءً",
      "02:50 صباحًا",
    ]),
  },
  {
    id: "fourth_jamarat",
    title: "رمي الجمرات - الرمية الرابعة",
    subtitle: "يوم 13 ذو الحجة",
    slots: makeSlots([
      "05:50 صباحًا",
      "06:50 صباحًا",
      "06:50 صباحًا",
      "07:50 صباحًا",
      "08:50 صباحًا",
      "09:40 صباحًا",
      "09:40 صباحًا",
      "—",
      "—",
    ]),
  },
];

function scheduleKey(sectionId, slot) {
  return `${sectionId}__${slot.groupId}`;
}

function getScheduleOccupancy(rows) {
  const counts = {};

  scheduleSections.forEach((section) => {
    section.slots.forEach((slot) => {
      counts[scheduleKey(section.id, slot)] = 0;
    });
  });

  rows.forEach((row) => {
    if (!row.scheduleId || !row.groupId) return;
    const key = `${row.scheduleId}__${row.groupId}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [selectedSchedule, setSelectedSchedule] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all"); const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem(AUTH_KEY);
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setAuthError("");
      return;
    }

    setAuthError("كلمة المرور غير صحيحة.");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };

  const loadRows = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/registrations", {
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRows(result.registrations || []);
      }
    } catch (error) {
      console.error("Failed to load admin rows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    loadRows();

    const interval = setInterval(loadRows, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const occupancy = useMemo(() => getScheduleOccupancy(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchSchedule =
        selectedSchedule === "all" ||
        row.scheduleId === selectedSchedule;

      const matchGroup =
        selectedGroup === "all" ||
        row.groupId === selectedGroup;

      return matchSchedule && matchGroup;
    });
  }, [rows, selectedSchedule, selectedGroup]);

  const totalPassengers = useMemo(() => {
    const uniquePeople = new Set();

    rows.forEach((row) => {
      uniquePeople.add(
        `${row.registrationId}-${row.personType}-${row.personName}-${row.floorNumber}-${row.seatNumber}`
      );
    });

    return uniquePeople.size;
  }, [rows]);

  const totalRegistrations = useMemo(() => {
    const ids = new Set();

    rows.forEach((row) => {
      if (row.registrationId) ids.add(row.registrationId);
    });

    return ids.size;
  }, [rows]);

  const filterButtons = useMemo(() => {
    return scheduleSections.flatMap((section) =>
      section.slots.map((slot) => ({
        key: `${section.id}__${slot.groupId}`,
        label: `${section.title} - ${slot.groupLabel} - ${slot.time}`,
      }))
    );
  }, []);

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <img
                src="/logo.png"
                alt="شعار الشركة"
                className="mx-auto mb-4 h-20 w-auto"
              />

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Lock className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                دخول لوحة التشغيل
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                يرجى إدخال كلمة المرور للوصول إلى بيانات التسجيل.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center outline-none transition focus:border-blue-500"
              />

              {authError && (
                <p className="rounded-2xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-gradient-to-l from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-blue-200 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
              <Table2 className="h-4 w-4" />
              لوحة التشغيل الداخلية
            </div>

            <h1 className="text-3xl font-bold">الكشف الحيّ للركاب</h1>

            <p className="mt-2 text-sm leading-7 text-blue-50">
              عرض مباشر من Google Sheets لمواعيد التنقلات والمناسك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadRows}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث البيانات
            </button>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              تسجيل الخروج
            </button>

            <img
              src="/logo.png"
              alt="شعار الشركة"
              className="h-16 w-auto rounded-xl bg-white/10 p-2"
            />
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">إجمالي الركاب المسجلين</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPassengers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">عدد التسجيلات</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalRegistrations}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">الحد الأقصى لكل فوج</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {MAX_CAPACITY}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="mb-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
            جاري تحميل البيانات من Google Sheets...
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Bus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  مؤشرات الأفواج
                </h2>
                <p className="text-sm text-slate-500">
                  عدد الركاب مقابل السعة المحددة لكل فوج.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {scheduleSections.map((section) => (
                <div key={section.id}>
                  <h3 className="mb-3 text-base font-bold text-slate-900">
                    {section.title}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.slots.map((slot) => {
                      const key = scheduleKey(section.id, slot);
                      const used = occupancy[key] || 0;
                      const remaining = MAX_CAPACITY - used;
                      const isFull = remaining <= 0;

                      return (
                        <div
                          key={key}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm text-slate-500">
                            {section.subtitle}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-blue-700">
                            {slot.groupLabel}
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {slot.time}
                          </p>

                          <p className="mt-3 text-sm text-slate-600">
                            {used} / {MAX_CAPACITY} راكب
                          </p>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (used / MAX_CAPACITY) * 100
                                )}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-xs font-medium text-slate-500">
                            {isFull
                              ? "اكتمل العدد"
                              : `المتبقي: ${Math.max(0, remaining)}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  جدول الركاب
                </h2>
                <p className="text-sm text-slate-500">
                  كل راكب يظهر في صف مستقل حسب المسار والفوج.
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  اختر المسار
                </label>

                <select
                  value={selectedSchedule}
                  onChange={(e) => {
                    setSelectedSchedule(e.target.value);
                    setSelectedGroup("all");
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="all">كل المسارات</option>

                  {scheduleSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  اختر الفوج
                </label>

                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="all">كل الأفواج</option>

                  {groupLabels.map((group, index) => (
                    <option key={index} value={`fawj_${index + 1}`}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-right">
                  <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">الاسم الأول</th>
                      <th className="px-4 py-3">الصفة</th>
                      <th className="px-4 py-3">المسار / النسك</th>
                      <th className="px-4 py-3">الفوج</th>
                      <th className="px-4 py-3">الوقت</th>
                      <th className="px-4 py-3">رقم الدور</th>
                      <th className="px-4 py-3">رقم المقعد</th>
                      <th className="px-4 py-3">احتياج خاص</th>
                      <th className="px-4 py-3">وقت التسجيل</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredRows.length > 0 ? (
                      filteredRows.map((row) => (
                        <tr key={row.rowId} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {row.personName}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.personType}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.scheduleTitle}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.groupLabel}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.scheduleTime}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.floorNumber || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.seatNumber || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.specialNeeds || "—"}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {row.submittedAt}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          لا توجد بيانات مسجلة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              هذه الصفحة تقرأ البيانات مباشرة من Google Sheets ويتم تحديثها
              تلقائيًا كل 15 ثانية.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}