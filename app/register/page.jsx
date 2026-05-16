"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Phone,
  Users,
  Accessibility,
  UserRound,
} from "lucide-react";

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

const emptySchedules = {
  mina_to_arafat: null,
  arafat_to_muzdalifah: null,
  muzdalifah_to_mina: null,
  second_jamarat: null,
  third_jamarat: null,
  fourth_jamarat: null,
};

const initialForm = {
  fullName: "",
  phone: "",
  gender: "",
  hasCompanions: "",
  companionsCount: 0,
  companions: [],
  specialNeeds: "",
  floorNumber: "",
  seatNumber: "",
  declarationAccepted: false,
  schedules: emptySchedules,
};

function cardClass(active = false) {
  return `rounded-3xl border transition-all duration-200 ${active
    ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
    }`;
}

function scheduleKey(sectionId, slot) {
  return `${sectionId}__${slot.groupId}`;
}

function getScheduleOccupancy(registrations) {
  const counts = {};

  scheduleSections.forEach((section) => {
    section.slots.forEach((slot) => {
      counts[scheduleKey(section.id, slot)] = 0;
    });
  });

  registrations.forEach((record) => {
    const seats =
      1 +
      (record.hasCompanions && Array.isArray(record.companions)
        ? record.companions.filter((name) => name && name.trim().length > 0).length
        : 0);

    Object.entries(record.schedules || {}).forEach(([sectionId, selected]) => {
      if (!selected?.groupId) return;
      const key = `${sectionId}__${selected.groupId}`;
      counts[key] = (counts[key] || 0) + seats;
    });
  });

  return counts;
}

function formatSelectedSchedule(selected) {
  if (!selected) return "—";
  return `${selected.groupLabel} - ${selected.time}`;
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

  const occupancy = useMemo(
    () => getScheduleOccupancy(registrations),
    [registrations]
  );

  const canContinueFromStep = useMemo(() => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return form.fullName.trim().length >= 3;
      case 2:
        return form.phone.trim().length >= 8 && !!form.gender;
      case 3:
        return !!form.hasCompanions;
      case 4:
        if (form.hasCompanions === "لا") return true;
        if (!form.companionsCount || form.companionsCount < 1) return false;
        return form.companions.every((name) => name.trim().length >= 2);
      case 5:
        return (
          !!form.specialNeeds &&
          form.floorNumber.trim().length > 0 &&
          form.seatNumber.trim().length > 0
        );
      case 6:
        return !!form.schedules.mina_to_arafat?.groupId;
      case 7:
        return !!form.schedules.arafat_to_muzdalifah?.groupId;
      case 8:
        return !!form.schedules.muzdalifah_to_mina?.groupId;
      case 9:
        return !!form.schedules.second_jamarat?.groupId;
      case 10:
        return !!form.schedules.third_jamarat?.groupId;
      case 11:
        return !!form.schedules.fourth_jamarat?.groupId;
      case 12:
        return form.declarationAccepted === true;
      default:
        return false;
    }
  }, [step, form]);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const updateSchedule = (sectionId, slot) => {
    setForm((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [sectionId]: slot,
      },
    }));
  };

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

  const validateCapacityForAllSchedules = () => {
    const seatsRequested =
      1 + (form.hasCompanions === "نعم" ? Number(form.companionsCount) : 0);

    for (const section of scheduleSections) {
      const selected = form.schedules[section.id];
      if (!selected?.groupId) continue;

      const key = `${section.id}__${selected.groupId}`;
      const used = occupancy[key] || 0;

      if (used + seatsRequested > MAX_CAPACITY) {
        return {
          ok: false,
          message: `عذرًا، لا توجد سعة كافية في الموعد المحدد ضمن "${section.title} - ${selected.groupLabel}". يرجى اختيار فوج آخر.`,
        };
      }
    }

    return { ok: true };
  };

  const submitRegistration = async () => {
    const capacityCheck = validateCapacityForAllSchedules();

    if (!capacityCheck.ok) {
      alert(capacityCheck.message);
      return;
    }

    const record = {
      id: `REG-${Date.now()}`,
      fullName: form.fullName,
      phone: form.phone,
      gender: form.gender,
      hasCompanions: form.hasCompanions === "نعم",
      companionsCount:
        form.hasCompanions === "نعم" ? Number(form.companionsCount) : 0,
      companions: form.hasCompanions === "نعم" ? form.companions : [],
      specialNeeds: form.specialNeeds,
      floorNumber: form.floorNumber,
      seatNumber: form.seatNumber,
      declarationAccepted: form.declarationAccepted,
      schedules: form.schedules,
      submittedAt: new Date().toLocaleTimeString("ar-SA", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert("حدث خطأ أثناء حفظ التسجيل في Google Sheets. يرجى المحاولة مرة أخرى.");
        return;
      }

      setRegistrations((prev) => [record, ...prev]);
      setSubmittedRecord(record);
      setStep(13);
    } catch (error) {
      console.error(error);
      alert("تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    }
  };

  const totalSteps = 12;

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
              يرجى استكمال الخطوات التالية لإتمام تسجيل مواعيدكم المعتمدة.
            </p>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${step === 13 ? 100 : Math.max(8, (step / totalSteps) * 100)
                  }%`,
              }}
            />
          </div>

          {step > 0 && step < 13 ? (
            <div className="mb-6 rounded-2xl bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-700">
              الخطوة {step} من {totalSteps}
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
                      مرحبًا بكم في منصة تنظيم وقتكم إلى إدارة مناسك الحج
                    </h2>
                    <p className="mt-4 leading-8 text-slate-600">
                      نسعد بخدمتكم في رحلتكم الإيمانية، وقد خُصصت هذه المنصة
                      لتسجيل المواعيد المعتمدة لتنقلاتكم ومناسككم وفق الجداول
                      الرسمية الصادرة من وزارة الحج والعمرة، بما يضمن تنظيمًا
                      أفضل وانسيابية أعلى خلال أداء المناسك.
                    </p>
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

              {step === 3 && (
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

              {step === 4 && (
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

              {step === 5 && (
                <StepShell
                  icon={<Accessibility className="h-5 w-5" />}
                  title="معلومات إضافية"
                  description="تُستخدم هذه البيانات لدعم التخطيط التشغيلي وتحسين مستوى الخدمة."
                >
                  <div className="grid gap-4 md:grid-cols-3">
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

                    <input
                      value={form.floorNumber}
                      onChange={(e) =>
                        updateForm({ floorNumber: e.target.value })
                      }
                      placeholder="رقم الدور"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                    />

                    <input
                      value={form.seatNumber}
                      onChange={(e) =>
                        updateForm({ seatNumber: e.target.value })
                      }
                      placeholder="رقم المقعد"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-blue-500"
                    />
                  </div>
                </StepShell>
              )}

              {step >= 6 && step <= 11 && (
                <ScheduleStep
                  section={scheduleSections[step - 6]}
                  selectedValue={form.schedules[scheduleSections[step - 6].id]}
                  onSelect={(slot) =>
                    updateSchedule(scheduleSections[step - 6].id, slot)
                  }
                  occupancy={occupancy}
                />
              )}

              {step === 12 && (
                <StepShell
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="مراجعة البيانات"
                  description="يرجى مراجعة المعلومات التالية قبل تأكيد التسجيل."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <ReviewItem label="الاسم الكامل" value={form.fullName} />
                    <ReviewItem label="رقم الجوال" value={form.phone} />
                    <ReviewItem label="الجنس" value={form.gender} />
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
                    <ReviewItem label="رقم الدور" value={form.floorNumber} />
                    <ReviewItem label="رقم المقعد" value={form.seatNumber} />

                    {scheduleSections.map((section) => (
                      <ReviewItem
                        key={section.id}
                        label={section.title}
                        value={formatSelectedSchedule(form.schedules[section.id])}
                      />
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.declarationAccepted}
                        onChange={(e) =>
                          updateForm({
                            declarationAccepted: e.target.checked,
                          })
                        }
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span className="text-sm leading-7 text-slate-700">
                        اقر بان التزم بالمواعيد المختارة وان الترم بمواعيد التفويج حسب ماتقرره وزارة الحج والعمرة في ذالك و اوافق على شروط و احكام الشركة في استخدام المعلومات التالية
                      </span>
                    </label>
                  </div>
                </StepShell>
              )}

              {step === 13 && submittedRecord && (
                <div className="space-y-5">
                  <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>

                      <div className="w-full">
                        <h3 className="text-2xl font-bold text-emerald-900">
                          شكرًا لكم، تم استلام التسجيل بنجاح
                        </h3>

                        <p className="mt-2 leading-7 text-emerald-800">
                          تم حفظ مواعيدكم المعتمدة بنجاح. نرجو الالتزام بالأوقات
                          المحددة وفق الجداول الرسمية المعتمدة من وزارة الحج
                          والعمرة، ونسأل الله لكم حجًا مبرورًا وسعيًا مشكورًا.
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <MiniStat
                            label="رقم التسجيل"
                            value={submittedRecord.id}
                          />
                          <MiniStat
                            label="وقت الإرسال"
                            value={submittedRecord.submittedAt}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="mb-4 text-lg font-bold text-slate-900">
                      مواقع مهمة خلال الرحلة
                    </h4>

                    <p className="mb-5 text-sm text-slate-600">
                      يمكنكم استخدام الروابط التالية للوصول المباشر إلى المواقع
                      المعتمدة عبر Google Maps.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <a
                        href="https://maps.app.goo.gl/3r2hbTcAsoUyqDVq7"
                        target="_blank"
                        rel="noreferrer"
                        className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-400 hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <h5 className="text-base font-bold text-slate-900">
                            موقع عرفات
                          </h5>
                          <p className="text-sm text-slate-500">
                            موقع الوقوف بعرفة يوم عرفة
                          </p>
                          <span className="inline-block text-sm font-semibold text-blue-600 group-hover:underline">
                            فتح في الخرائط ←
                          </span>
                        </div>
                      </a>

                      <a
                        href="https://maps.app.goo.gl/TvRReTGSs8e55m5z9"
                        target="_blank"
                        rel="noreferrer"
                        className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-400 hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <h5 className="text-base font-bold text-slate-900">
                            موقع مزدلفة
                          </h5>
                          <p className="text-sm text-slate-500">
                            موقع المبيت بعد الإفاضة من عرفات
                          </p>
                          <span className="inline-block text-sm font-semibold text-blue-600 group-hover:underline">
                            فتح في الخرائط ←
                          </span>
                        </div>
                      </a>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={resetForm}
                        className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                      >
                        تسجيل جديد
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 13 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                السابق
              </button>

              {step === 12 ? (
                <button
                  onClick={submitRegistration}
                  disabled={!Boolean(canContinueFromStep)}
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  تأكيد التسجيل
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => Math.min(12, s + 1))}
                  disabled={!Boolean(canContinueFromStep)}
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

function ScheduleStep({ section, selectedValue, onSelect, occupancy }) {
  return (
    <StepShell
      icon={<Clock3 className="h-5 w-5" />}
      title={section.title}
      description={`يرجى اختيار الفوج والوقت المعتمد لـ ${section.subtitle}.`}
    >
      <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
        السعة القصوى لكل فوج: <span className="font-bold">{MAX_CAPACITY}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {section.slots.map((slot) => {
          const used = occupancy[scheduleKey(section.id, slot)] || 0;
          const remaining = MAX_CAPACITY - used;
          const isFull = remaining <= 0;

          return (
            <button
              key={slot.groupId}
              disabled={isFull}
              onClick={() => onSelect(slot)}
              className={`${cardClass(
                selectedValue?.groupId === slot.groupId
              )} p-5 text-right disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    {slot.groupLabel}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {slot.time}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    السعة القصوى: {MAX_CAPACITY} حاج
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${isFull
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