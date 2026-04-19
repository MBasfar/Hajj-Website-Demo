"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Table2, Users, Bus } from "lucide-react";

const STORAGE_KEY = "hajj_registrations";
const MAX_CAPACITY = 188;

const days = [
  {
    id: "day1",
    label: "اليوم الأول",
    date: "الأحد 12 ذو الحجة",
    slots: [
      { id: "d1-08", time: "08:00 صباحًا", capacity: MAX_CAPACITY },
      { id: "d1-09", time: "09:00 صباحًا", capacity: MAX_CAPACITY },
      { id: "d1-10", time: "10:00 صباحًا", capacity: MAX_CAPACITY },
      { id: "d1-11", time: "11:00 صباحًا", capacity: MAX_CAPACITY },
    ],
  },
  {
    id: "day2",
    label: "اليوم الثاني",
    date: "الاثنين 13 ذو الحجة",
    slots: [
      { id: "d2-08", time: "08:00 صباحًا", capacity: MAX_CAPACITY },
      { id: "d2-09", time: "09:00 صباحًا", capacity: MAX_CAPACITY },
      { id: "d2-10", time: "10:00 صباحًا", capacity: MAX_CAPACITY },
      { id: "d2-11", time: "11:00 صباحًا", capacity: MAX_CAPACITY },
    ],
  },
];

export default function AdminPage() {
  const [sheetFilter, setSheetFilter] = useState("all");
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

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const allSlots = days.flatMap((day) =>
    day.slots.map((slot) => ({
      ...slot,
      dayId: day.id,
      dayLabel: day.label,
      date: day.date,
    }))
  );

  const occupancy = useMemo(() => {
    const counts = {};
    for (const day of days) {
      for (const slot of day.slots) counts[slot.id] = 0;
    }

    registrations.forEach((r) => {
      counts[r.slotId] =
        (counts[r.slotId] || 0) + 1 + (Number(r.companionsCount) || 0);
    });

    return counts;
  }, [registrations]);

  const filteredSheetRows = useMemo(() => {
    if (sheetFilter === "all") return registrations;
    return registrations.filter((r) => r.slotId === sheetFilter);
  }, [registrations, sheetFilter]);

  const totalPassengers = useMemo(() => {
    return registrations.reduce(
      (sum, r) => sum + 1 + (Number(r.companionsCount) || 0),
      0
    );
  }, [registrations]);

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
              عرض داخلي للركاب حسب اليوم ووقت الحافلة، مع قراءة مباشرة من
              التسجيلات المحفوظة محليًا.
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

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  مؤشرات الفترات
                </h2>
                <p className="text-sm text-slate-500">
                  عدد الركاب مقابل السعة المحددة لكل فترة.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {allSlots.map((slot) => {
                const used = occupancy[slot.id] || 0;
                const remaining = slot.capacity - used;
                const isFull = remaining <= 0;

                return (
                  <div
                    key={slot.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm text-slate-500">{slot.dayLabel}</p>
                    <p className="mt-1 font-bold text-slate-900">{slot.time}</p>
                    <p className="mt-3 text-sm text-slate-600">
                      {used} / {slot.capacity} راكب
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(100, (used / slot.capacity) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {isFull ? "اكتمل العدد" : `المتبقي: ${Math.max(0, remaining)}`}
                    </p>
                  </div>
                );
              })}
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
                  عرض مباشر للركاب حسب الفترة المحددة.
                </p>
              </div>
            </div>

            <div className="mb-4 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setSheetFilter("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    sheetFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  الكل
                </button>

                {allSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSheetFilter(slot.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                      sheetFilter === slot.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {slot.dayLabel} - {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-right">
                  <thead className="bg-slate-100 text-xs font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-3">الاسم</th>
                      <th className="px-4 py-3">اليوم</th>
                      <th className="px-4 py-3">الوقت</th>
                      <th className="px-4 py-3">الجوال</th>
                      <th className="px-4 py-3">الجنس</th>
                      <th className="px-4 py-3">المرافقون</th>
                      <th className="px-4 py-3">مدينة السكن</th>
                      <th className="px-4 py-3">وقت التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredSheetRows.length > 0 ? (
                      filteredSheetRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {row.fullName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.dayLabel}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.slotTime}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.phone}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.gender}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.hasCompanions
                              ? row.companions.join("، ")
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.city}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.submittedAt}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
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
              هذه الصفحة تقرأ التسجيلات المحفوظة من نفس المتصفح. عند ربط النظام
              لاحقًا مع Google Sheets أو قاعدة بيانات، ستصبح البيانات مشتركة بين
              جميع الأجهزة.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}