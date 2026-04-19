"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CalendarDays,
  Clock3,
  Phone,
  Users,
  MapPin,
  Accessibility,
  UserRound,
} from "lucide-react";

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

const initialForm = {
  fullName: "",
  phone: "",
  gender: "",
  dayId: "",
  slotId: "",
  hasCompanions: "",
  companionsCount: 0,
  companions: [],
  specialNeeds: "",
  city: "",
};

function getDay(dayId) {
  return days.find((d) => d.id === dayId);
}

function getSlot(dayId, slotId) {
  return getDay(dayId)?.slots.find((s) => s.id === slotId);
}

function cardClass(active = false) {
  return `rounded-3xl border transition-all duration-200 ${
    active
      ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
  }`;
}

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [registrations, setRegistrations] = useState([]);
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setRegistrations(JSON.parse(raw));
      } catch {
        setRegistrations([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    }
  }, [registrations, isLoaded]);

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

  const selectedDay = getDay(form.dayId);
  const selectedSlot = getSlot(form.dayId, form.slotId);

  const canContinueFromStep = useMemo(() => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return form.fullName.trim().length >= 3;
      case 2:
        return !!form.dayId;
      case 3:
        return !!form.slotId;
      case 4:
        return form.phone.trim().length >= 8 && !!form.gender;
      case 5:
        return !!form.hasCompanions;
      case 6:
        if (form.hasCompanions === "لا") return true;
        if (!form.companionsCount || form.companionsCount < 1) return false;
        return form.companions.every((name) => name.trim().length >= 2);
      case 7:
        return !!form.specialNeeds && form.city.trim().length >= 2;
      case 8:
        return true;
      default:
        return false;
    }
  }, [step, form]);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const resetForm = () => {
    setForm(initialForm);
    setStep(0);
    setSubmittedRecord(null);
  };

  const handleCompanionsToggle = (value) => {
    if (value === "لا") {
      updateForm({
        hasCompanions: value,
        companionsCount: 0,
        companions: [],
      });
      return;
    }

    updateForm({
      hasCompanions: value,
      companionsCount: 1,
      companions: [""],
    });
  };

  const handleCompanionCountChange = (count) => {
    const safeCount = Math.max(1, Math.min(10, Number(count) || 1));
    const next = Array.from(
      { length: safeCount },
      (_, i) => form.companions[i] || ""
    );
    updateForm({ companionsCount: safeCount, companions: next });
  };

  const handleCompanionNameChange = (index, value) => {
    const next = [...form.companions];
    next[index] = value;
    updateForm({ companions: next });
  };

  const submitRegistration = () => {
    const day = getDay(form.dayId);
    const slot = getSlot(form.dayId, form.slotId);

    if (!day || !slot) return;

    const used = occupancy[slot.id] || 0;
    const requestedSeats =
      1 + (form.hasCompanions === "نعم" ? Number(form.companionsCount) : 0);

    if (used + requestedSeats > slot.capacity) {
      alert("عذرًا، لا توجد سعة كافية في هذه الفترة. يرجى اختيار وقت آخر.");
      return;
    }

    const record = {
      id: `REG-${Date.now()}`,
      fullName: form.fullName,
      phone: form.phone,
      gender: form.gender,
      dayId: day.id,
      dayLabel: day.label,
      slotId: slot.id,
      slotTime: slot.time,
      hasCompanions: form.hasCompanions === "نعم",
      companionsCount:
        form.hasCompanions === "نعم" ? Number(form.companionsCount) : 0,
      companions: form.hasCompanions === "نعم" ? form.companions : [],
      specialNeeds: form.specialNeeds,
      city: form.city,
      submittedAt: new Date().toLocaleTimeString("ar-SA", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setRegistrations((prev) => [record, ...prev]);
    setSubmittedRecord(record);
    setStep(9);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-6 text-center">
            <img
              src="/logo.png"
              alt="شعار الشركة"
              className="mx-auto mb-4 h-20 w-auto"
            />
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              تسجيل الحجاج
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              يرجى استكمال الخطوات التالية لإتمام التسجيل واختيار الموعد المناسب.
            </p>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${step === 9 ? 100 : Math.max(8, (step / 8) * 100)}%`,
              }}
            />
          </div>

          {step > 0 && step < 9 ? (
            <div className="mb-6 rounded-2xl bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-700">
              الخطوة {step} من 8
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {step === 0 && (
                <div className="space-y-6 text-center">
                  <div className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                      مرحبًا بكم في منصة التسجيل
                    </h2>
                    <p className="mt-3 leading-8 text-slate-600">
                      نسعد بخدمتكم ونسعى إلى تسهيل إجراءات التنظيم والتنقل من
                      خلال تسجيل البيانات واختيار الموعد المناسب وفق المقاعد
                      المتاحة لكل حافلة.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">نوع الخدمة</p>
                        <p className="mt-2 font-semibold text-slate-900">
                          تسجيل إلكتروني
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">السعة لكل فوج</p>
                        <p className="mt-2 font-semibold text-blue-700">
                          188 حاج
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-slate-500">طريقة العرض</p>
                        <p className="mt-2 font-semibold text-slate-900">
                          خطوات واضحة ومبسطة
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <StepShell
                  icon={<UserRound className="h-5 w-5" />}
                  title="تسجيل الاسم"
                  description="يرجى إدخال الاسم الكامل كما هو في المستندات الرسمية."
                >
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      updateForm({ fullName: e.target.value })
                    }
                    placeholder="الاسم الكامل"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-blue-500"
                  />
                </StepShell>
              )}

              {step === 2 && (
                <StepShell
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="اختيار يوم الرحلة"
                  description="يرجى تحديد اليوم المناسب من بين الخيارات المتاحة."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {days.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => updateForm({ dayId: day.id, slotId: "" })}
                        className={`${cardClass(
                          form.dayId === day.id
                        )} p-5 text-right`}
                      >
                        <p className="text-lg font-bold text-slate-900">
                          {day.label}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {day.date}
                        </p>
                      </button>
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell
                  icon={<Clock3 className="h-5 w-5" />}
                  title="اختيار الفترة الزمنية"
                  description="تظهر أدناه الفترات المتاحة لليوم المحدد. يتم إغلاق الفترة تلقائيًا عند اكتمال العدد."
                >
                  <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                    اليوم المحدد:{" "}
                    <span className="font-bold">{selectedDay?.label}</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedDay?.slots.map((slot) => {
                      const used = occupancy[slot.id] || 0;
                      const remaining = slot.capacity - used;
                      const isFull = remaining <= 0;

                      return (
                        <button
                          key={slot.id}
                          disabled={isFull}
                          onClick={() => updateForm({ slotId: slot.id })}
                          className={`${cardClass(
                            form.slotId === slot.id
                          )} p-5 text-right disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold text-slate-900">
                                {slot.time}
                              </p>
                              <p className="mt-2 text-sm text-slate-500">
                                السعة القصوى: {slot.capacity} راكب
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                isFull
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {isFull ? "مكتمل" : `${remaining} متبقٍ`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell
                  icon={<Phone className="h-5 w-5" />}
                  title="بيانات التواصل"
                  description="يرجى إدخال رقم الجوال والجنس لضمان وضوح بيانات التسجيل."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={form.phone}
                      onChange={(e) => updateForm({ phone: e.target.value })}
                      placeholder="رقم الجوال للتواصل"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                    />
                    <select
                      value={form.gender}
                      onChange={(e) => updateForm({ gender: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                    >
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                </StepShell>
              )}

              {step === 5 && (
                <StepShell
                  icon={<Users className="h-5 w-5" />}
                  title="المرافقون"
                  description="هل يوجد مرافقون ضمن هذا التسجيل؟"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {["نعم", "لا"].map((answer) => (
                      <button
                        key={answer}
                        onClick={() => handleCompanionsToggle(answer)}
                        className={`${cardClass(
                          form.hasCompanions === answer
                        )} p-5 text-center text-lg font-bold`}
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 6 && (
                <StepShell
                  icon={<Users className="h-5 w-5" />}
                  title="بيانات المرافقين"
                  description={
                    form.hasCompanions === "نعم"
                      ? "الرجاء تحديد عدد المرافقين ثم إدخال أسمائهم كما هي في المستندات الرسمية."
                      : "لا يوجد مرافقون ضمن هذا التسجيل."
                  }
                >
                  {form.hasCompanions === "نعم" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          الرجاء تحديد عدد المرافقين
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={form.companionsCount}
                          onChange={(e) =>
                            handleCompanionCountChange(e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                        />
                      </div>

                      <div className="grid gap-3">
                        {form.companions.map((name, index) => (
                          <input
                            key={index}
                            value={name}
                            onChange={(e) =>
                              handleCompanionNameChange(index, e.target.value)
                            }
                            placeholder={`اسم المرافق ${index + 1}`}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                      لا يوجد مرافقون مضافون في هذا التسجيل.
                    </div>
                  )}
                </StepShell>
              )}

              {step === 7 && (
                <StepShell
                  icon={<Accessibility className="h-5 w-5" />}
                  title="معلومات إضافية"
                  description="تُستخدم هذه البيانات لدعم التخطيط التشغيلي وتحسين مستوى الخدمة."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={form.specialNeeds}
                      onChange={(e) =>
                        updateForm({ specialNeeds: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                    >
                      <option value="">
                        هل يوجد أحد من المسجلين يحتاج إلى خدمات أو تسهيلات خاصة؟
                      </option>
                      <option value="نعم">نعم</option>
                      <option value="لا">لا</option>
                    </select>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        value={form.city}
                        onChange={(e) => updateForm({ city: e.target.value })}
                        placeholder="مدينة السكن الحالية"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 8 && (
                <StepShell
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="مراجعة البيانات"
                  description="يرجى مراجعة المعلومات التالية قبل تأكيد التسجيل."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <ReviewItem label="الاسم الكامل" value={form.fullName} />
                    <ReviewItem label="رقم الجوال" value={form.phone} />
                    <ReviewItem label="الجنس" value={form.gender} />
                    <ReviewItem label="اليوم" value={selectedDay?.label} />
                    <ReviewItem label="الوقت" value={selectedSlot?.time} />
                    <ReviewItem label="المرافقون" value={form.hasCompanions} />
                    <ReviewItem
                      label="عدد المرافقين"
                      value={
                        form.hasCompanions === "نعم"
                          ? String(form.companionsCount)
                          : "0"
                      }
                    />
                    <ReviewItem
                      label="أسماء المرافقين"
                      value={
                        form.hasCompanions === "نعم"
                          ? form.companions.join("، ")
                          : "لا يوجد"
                      }
                    />
                    <ReviewItem
                      label="احتياجات خاصة"
                      value={form.specialNeeds}
                    />
                    <ReviewItem label="مدينة السكن" value={form.city} />
                  </div>
                </StepShell>
              )}

              {step === 9 && submittedRecord && (
                <div className="space-y-5">
                  <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-emerald-900">
                          تم استلام التسجيل بنجاح
                        </h3>
                        <p className="mt-2 leading-7 text-emerald-800">
                          تم حفظ التسجيل، ويمكن عرضه في جدول الإدارة من نفس
                          الجهاز والمتصفح.
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <MiniStat
                            label="رقم التسجيل"
                            value={submittedRecord.id}
                          />
                          <MiniStat
                            label="اليوم"
                            value={submittedRecord.dayLabel}
                          />
                          <MiniStat
                            label="الوقت"
                            value={submittedRecord.slotTime}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={resetForm}
                      className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                    >
                      تسجيل جديد
                    </button>
                    <a
                      href="/admin"
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      عرض لوحة التشغيل
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 9 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                السابق
              </button>

              {step === 8 ? (
                <button
                  onClick={submitRegistration}
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                >
                  تأكيد التسجيل
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => Math.min(8, s + 1))}
                  disabled={!canContinueFromStep}
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  متابعة
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepShell({ icon, title, description, children }) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-7 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value || "—"}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4">
      <p className="text-sm text-emerald-700">{label}</p>
      <p className="mt-2 font-bold text-slate-900">{value}</p>
    </div>
  );
}