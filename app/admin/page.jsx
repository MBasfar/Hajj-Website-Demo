"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Table2, Users, Bus } from "lucide-react";

const STORAGE_KEY = "hajj_registrations";
const MAX_CAPACITY = 188;

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
    subtitle: "يوم 9 ذو الحجة",
    slots: makeSlots([
      "01:30 صباحًا",
      "03:00 صباحًا",
      "03:10 صباحًا",
      "03:20 صباحًا",
      "03:30 صباحًا",
      "03:40 صباحًا",
      "08:50 صباحًا",
      "09:00 صباحًا",
      "09:10 صباحًا",
    ]),
  },
  {
    id: "arafat_to_muzdalifah",
    title: "عملية الإفاضة من عرفات إلى مزدلفة",
    subtitle: "يوم 9 ذو الحجة",
    slots: makeSlots([
      "07:30 مساءً",
      "07:30 مساءً",
      "07:40 مساءً",
      "07:40 مساءً",
      "07:50 مساءً",
      "07:50 مساءً",
      "07:50 مساءً",
      "08:20 مساءً",
      "08:30 مساءً",
    ]),
  },
  {
    id: "muzdalifah_to_mina",
    title: "عملية الإفاضة من مزدلفة إلى منى",
    subtitle: "يوم 10 ذو الحجة",
    slots: makeSlots([
      "01:00 صباحًا",
      "01:10 صباحًا",
      "01:20 صباحًا",
      "02:30 صباحًا",
      "02:40 صباحًا",
      "02:50 صباحًا",
      "03:00 صباحًا",
      "03:10 صباحًا",
      "03:20 صباحًا",
    ]),
  },
  {
    id: "second_jamarat",
    title: "رمي الجمرات - الرمية الثانية",
    subtitle: "يوم 11 و12 ذو الحجة",
    slots: makeSlots([
      "04:40 مساءً",
      "05:50 مساءً",
      "07:00 مساءً",
      "08:00 مساءً",
      "08:40 مساءً",
      "09:20 مساءً",
      "10:20 مساءً",
      "12:20 صباحًا",
      "12:40 صباحًا",
    ]),
  },
  {
    id: "third_jamarat",
    title: "رمي الجمرات - الرمية الثالثة",
    subtitle: "يوم 12 ذو الحجة",
    slots: makeSlots([
      "05:00 صباحًا",
      "05:20 صباحًا",
      "05:30 صباحًا",
      "05:50 صباحًا",
      "06:10 صباحًا",
      "06:20 صباحًا",
      "06:40 صباحًا",
      "06:50 صباحًا",
      "07:10 صباحًا",
    ]),
  },
  {
    id: "fourth_jamarat",
    title: "رمي الجمرات - الرمية الرابعة",
    subtitle: "يوم 13 ذو الحجة",
    slots: makeSlots([
      "05:00 صباحًا",
      "05:10 صباحًا",
      "05:20 صباحًا",
      "05:30 صباحًا",
      "06:10 صباحًا",
      "06:20 صباحًا",
      "06:30 صباحًا",
      "06:40 صباحًا",
      "06:50 صباحًا",
    ]),
  },
];

function scheduleKey(sectionId, slot) {
  return `${sectionId}__${slot.groupId}`;
}

function getPeopleCount(record) {
  const companionsTotal =
    record.hasCompanions && Array.isArray(record.companions)
      ? record.companions.filter(
          (c) =>
            c?.firstName?.trim() &&
            c?.floorNumber?.trim() &&
            c?.seatNumber?.trim()
        ).length
      : 0;

  return 1 + companionsTotal;
}

function flattenRegistrationsToRows(registrations) {
  const rows = [];

  registrations.forEach((record) => {
    const schedules = record.schedules || {};

    const scheduleEntries = scheduleSections
      .map((section) => ({
        scheduleId: section.id,
        scheduleTitle: section.title,
        scheduleSubtitle: section.subtitle,
        selected: schedules[section.id] || null,
      }))
      .filter((item) => item.selected?.groupId);

    scheduleEntries.forEach((scheduleEntry) => {
      rows.push({
        rowId: `${record.id}-${scheduleEntry.scheduleId}-main`,
        registrationId: record.id,
        personName: record.firstName,
        personType: "المسجل الرئيسي",
        floorNumber: record.floorNumber,
        seatNumber: record.seatNumber,
        specialNeeds: record.specialNeeds,
        submittedAt: record.submittedAt,
        scheduleId: scheduleEntry.scheduleId,
        scheduleTitle: scheduleEntry.scheduleTitle,
        scheduleSubtitle: scheduleEntry.scheduleSubtitle,
        groupId: scheduleEntry.selected.groupId,
        groupLabel: scheduleEntry.selected.groupLabel,
        scheduleTime: scheduleEntry.selected.time,
      });

      (record.companions || []).forEach((companion, index) => {
        rows.push({
          rowId: `${record.id}-${scheduleEntry.scheduleId}-companion-${index}`,
          registrationId: record.id,
          personName: companion.firstName,
          personType: "مرافق",
          floorNumber: companion.floorNumber,
          seatNumber: companion.seatNumber,
          specialNeeds: record.specialNeeds,
          submittedAt: record.submittedAt,
          scheduleId: scheduleEntry.scheduleId,
          scheduleTitle: scheduleEntry.scheduleTitle,
          scheduleSubtitle: scheduleEntry.scheduleSubtitle,
          groupId: scheduleEntry.selected.groupId,
          groupLabel: scheduleEntry.selected.groupLabel,
          scheduleTime: scheduleEntry.selected.time,
        });
      });
    });
  });

  return rows;
}

function getScheduleOccupancy(registrations) {
  const counts = {};

  scheduleSections.forEach((section) => {
    section.slots.forEach((slot) => {
      counts[scheduleKey(section.id, slot)] = 0;
    });
  });

  registrations.forEach((record) => {
    const seats = getPeopleCount(record);

    Object.entries(record.schedules || {}).forEach(([sectionId, selected]) => {
      if (!selected?.groupId) return;
      const key = `${sectionId}__${selected.groupId}`;
      counts[key] = (counts[key] || 0) + seats;
    });
  });

  return counts;
}

export default function AdminPage() {
  const [filterValue, setFilterValue] = useState("all");
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const loadRegistrations = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setRegistrations(raw ? JSON.parse(raw) : []);
      } catch {
        setRegistrations([]);
      }
    };

    loadRegistrations();

    const handleStorage = () => loadRegistrations();
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(loadRegistrations, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const occupancy = useMemo(
    () => getScheduleOccupancy(registrations),
    [registrations]
  );

  const allRows = useMemo(
    () => flattenRegistrationsToRows(registrations),
    [registrations]
  );

  const filteredRows = useMemo(() => {
    if (filterValue === "all") return allRows;

    const [scheduleId, groupId] = filterValue.split("__");
    return allRows.filter(
      (row) => row.scheduleId === scheduleId && row.groupId === groupId
    );
  }, [allRows, filterValue]);

  const totalPassengers = useMemo(() => {
    return registrations.reduce((sum, record) => {
      return sum + getPeopleCount(record);
    }, 0);
  }, [registrations]);

  const filterButtons = useMemo(() => {
    return scheduleSections.flatMap((section) =>
      section.slots.map((slot) => ({
        key: `${section.id}__${slot.groupId}`,
        label: `${section.title} - ${slot.groupLabel} - ${slot.time}`,
      }))
    );
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-gradient-to-l from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-blue-200 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
              <Table2 className="h-4 w-4" />
              لوحة التشغيل الداخلية
            </div>
            <h1 className="text-3xl font-bold">الكشف الحيّ للركاب</h1>
            <p className="mt-2 text-sm leading-7 text-blue-50">
              عرض داخلي لمواعيد التنقلات والمناسك، مع إظهار كل مرافق في صف مستقل.
            </p>
          </div>

          <img
            src="/logo.png"
            alt="شعار الشركة"
            className="h-16 w-auto rounded-xl bg-white/10 p-2"
          />
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
              {registrations.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">الحد الأقصى لكل فوج</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {MAX_CAPACITY}
            </p>
          </div>
        </div>

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
                  كل مرافق يظهر في صف مستقل ضمن كل فوج وموعد.
                </p>
              </div>
            </div>

            <div className="mb-4 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setFilterValue("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    filterValue === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  الكل
                </button>

                {filterButtons.map((button) => (
                  <button
                    key={button.key}
                    onClick={() => setFilterValue(button.key)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                      filterValue === button.key
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
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
                          لا توجد تسجيلات بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              هذه الصفحة تقرأ التسجيلات من نفس المتصفح محليًا. لاحقًا يمكن ربطها
              مباشرة مع Google Sheets لعرض البيانات المشتركة بين الأجهزة.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}