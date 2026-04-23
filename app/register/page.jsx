"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Phone,
  Users,
  MapPin,
  Accessibility,
  UserRound,
} from "lucide-react";

const STORAGE_KEY = "hajj_registrations";
const MAX_CAPACITY = 188;

const scheduleSections = [
  {
    id: "mina_to_arafat",
    title: "مسار عملية التصعيد من منى إلى عرفات",
    subtitle: "يوم 9 ذو الحجة",
    times: [
      "01:30 صباحًا",
      "03:00 صباحًا",
      "03:10 صباحًا",
      "03:20 صباحًا",
      "03:30 صباحًا",
      "03:40 صباحًا",
      "08:50 صباحًا",
      "09:00 صباحًا",
      "09:10 صباحًا",
    ],
  },
  {
    id: "arafat_to_muzdalifah",
    title: "عملية الإفاضة من عرفات إلى مزدلفة",
    subtitle: "يوم 9 ذو الحجة",
    times: [
      "07:30 مساءً",
      "07:40 مساءً",
      "07:50 مساءً",
      "08:20 مساءً",
      "08:30 مساءً",
    ],
  },
  {
    id: "muzdalifah_to_mina",
    title: "عملية الإفاضة من مزدلفة إلى منى",
    subtitle: "يوم 10 ذو الحجة",
    times: [
      "01:00 صباحًا",
      "01:10 صباحًا",
      "01:20 صباحًا",
      "02:30 صباحًا",
      "02:40 صباحًا",
      "02:50 صباحًا",
      "03:00 صباحًا",
      "03:10 صباحًا",
      "03:20 صباحًا",
    ],
  },
  {
    id: "second_jamarat",
    title: "رمي الجمرات - الرمية الثانية",
    subtitle: "يوم 11 و12 ذو الحجة",
    times: [
      "04:40 مساءً",
      "05:50 مساءً",
      "07:00 مساءً",
      "08:00 مساءً",
      "08:40 مساءً",
      "09:20 مساءً",
      "10:20 مساءً",
      "12:20 صباحًا",
      "12:40 صباحًا",
    ],
  },
  {
    id: "third_jamarat",
    title: "رمي الجمرات - الرمية الثالثة",
    subtitle: "يوم 12 ذو الحجة",
    times: [
      "05:00 صباحًا",
      "05:20 صباحًا",
      "05:30 صباحًا",
      "05:50 صباحًا",
      "06:10 صباحًا",
      "06:20 صباحًا",
      "06:40 صباحًا",
      "06:50 صباحًا",
      "07:10 صباحًا",
    ],
  },
  {
    id: "fourth_jamarat",
    title: "رمي الجمرات - الرمية الرابعة",
    subtitle: "يوم 13 ذو الحجة",
    times: [
      "05:00 صباحًا",
      "05:10 صباحًا",
      "05:20 صباحًا",
      "05:30 صباحًا",
      "06:10 صباحًا",
      "06:20 صباحًا",
      "06:30 صباحًا",
      "06:40 صباحًا",
      "06:50 صباحًا",
    ],
  },
];

const initialForm = {
  fullName: "",
  phone: "",
  gender: "",
  hasCompanions: "",
  companionsCount: 0,
  companions: [],
  specialNeeds: "",
  city: "",
  confirmFullNameText: "",
  schedules: {
    mina_to_arafat: "",
    arafat_to_muzdalifah: "",
    muzdalifah_to_mina: "",
    second_jamarat: "",
    third_jamarat: "",
    fourth_jamarat: "",
  },
};

function cardClass(active = false) {
  return `rounded-3xl border transition-all duration-200 ${active
    ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
    }`;
}

function getScheduleOccupancy(registrations) {
  const counts = {};

  scheduleSections.forEach((section) => {
    section.times.forEach((time) => {
      counts[`${section.id}__${time}`] = 0;
    });
  });

  registrations.forEach((record) => {
    const seats = 1 + (Number(record.companionsCount) || 0);

    Object.entries(record.schedules || {}).forEach(([sectionId, time]) => {
      if (!time) return;
      const key = `${sectionId}__${time}`;
      counts[key] = (counts[key] || 0) + seats;
    });
  });

  return counts;
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
        return !!form.specialNeeds && form.city.trim().length >= 2;
      case 6:
        return !!form.schedules.mina_to_arafat;
      case 7:
        return !!form.schedules.arafat_to_muzdalifah;
      case 8:
        return !!form.schedules.muzdalifah_to_mina;
      case 9:
        return !!form.schedules.second_jamarat;
      case 10:
        return !!form.schedules.third_jamarat;
      case 11:
        return !!form.schedules.fourth_jamarat;
      case 12:
        return (
          form.confirmFullNameText.trim() === form.fullName.trim() &&
          form.fullName.trim().length > 0
        );
      default:
        return false;
    }
  }, [step, form]);

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const updateSchedule = (sectionId, time) => {
    setForm((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [sectionId]: time,
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
      const selectedTime = form.schedules[section.id];
      if (!selectedTime) continue;

      const key = `${section.id}__${selectedTime}`;
      const used = occupancy[key] || 0;

      if (used + seatsRequested > MAX_CAPACITY) {
        return {
          ok: false,
          message: `عذرًا، لا توجد سعة كافية في الموعد المحدد ضمن "${section.title}". يرجى اختيار وقت آخر.`,
        };
      }
    }

    return { ok: true };
  };

  const submitRegistration = () => {
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
      city: form.city,
      schedules: form.schedules,
      submittedAt: new Date().toLocaleTimeString("ar-SA", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setRegistrations((prev) => [record, ...prev]);
    setSubmittedRecord(record);
    setStep(13);
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

              {step === 6 && (
                <ScheduleStep
                  section={scheduleSections[0]}
                  selectedValue={form.schedules.mina_to_arafat}
                  onSelect={(time) => updateSchedule("mina_to_arafat", time)}
                  occupancy={occupancy}
                />
              )}

              {step === 7 && (
                <ScheduleStep
                  section={scheduleSections[1]}
                  selectedValue={form.schedules.arafat_to_muzdalifah}
                  onSelect={(time) =>
                    updateSchedule("arafat_to_muzdalifah", time)
                  }
                  occupancy={occupancy}
                />
              )}

              {step === 8 && (
                <ScheduleStep
                  section={scheduleSections[2]}
                  selectedValue={form.schedules.muzdalifah_to_mina}
                  onSelect={(time) => updateSchedule("muzdalifah_to_mina", time)}
                  occupancy={occupancy}
                />
              )}

              {step === 9 && (
                <ScheduleStep
                  section={scheduleSections[3]}
                  selectedValue={form.schedules.second_jamarat}
                  onSelect={(time) => updateSchedule("second_jamarat", time)}
                  occupancy={occupancy}
                />
              )}

              {step === 10 && (
                <ScheduleStep
                  section={scheduleSections[4]}
                  selectedValue={form.schedules.third_jamarat}
                  onSelect={(time) => updateSchedule("third_jamarat", time)}
                  occupancy={occupancy}
                />
              )}

              {step === 11 && (
                <ScheduleStep
                  section={scheduleSections[5]}
                  selectedValue={form.schedules.fourth_jamarat}
                  onSelect={(time) => updateSchedule("fourth_jamarat", time)}
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
                    <ReviewItem label="مدينة السكن" value={form.city} />
                    <ReviewItem
                      label="منى إلى عرفات"
                      value={form.schedules.mina_to_arafat}
                    />
                    <ReviewItem
                      label="عرفات إلى مزدلفة"
                      value={form.schedules.arafat_to_muzdalifah}
                    />
                    <ReviewItem
                      label="مزدلفة إلى منى"
                      value={form.schedules.muzdalifah_to_mina}
                    />
                    <ReviewItem
                      label="الرمية الثانية"
                      value={form.schedules.second_jamarat}
                    />
                    <ReviewItem
                      label="الرمية الثالثة"
                      value={form.schedules.third_jamarat}
                    />
                    <ReviewItem
                      label="الرمية الرابعة"
                      value={form.schedules.fourth_jamarat}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-3 text-sm leading-7 text-slate-700">
                      أقر بصحة البيانات المدخلة وبأن الاسم المسجل هو اسمي الكامل، وأتحمل مسؤولية أي خطأ في المعلومات.
                    </p>

                    <input
                      type="text"
                      value={form.confirmFullNameText}
                      onChange={(e) =>
                        updateForm({ confirmFullNameText: e.target.value })
                      }
                      placeholder="اكتب الاسم الكامل مرة أخرى للتأكيد"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-blue-500"
                    />

                    {form.confirmFullNameText &&
                      form.confirmFullNameText.trim() !== form.fullName.trim() && (
                        <p className="mt-3 text-sm font-medium text-red-600">
                          الاسم المدخل لا يطابق الاسم المسجل في بداية الطلب.
                        </p>
                      )}
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
                          تم حفظ مواعيدكم المعتمدة بنجاح. نرجو الالتزام بالأوقات المحددة وفق
                          الجداول الرسمية المعتمدة من وزارة الحج والعمرة، ونسأل الله لكم حجًا
                          مبرورًا وسعيًا مشكورًا.
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
                      يمكنكم استخدام الروابط التالية للوصول المباشر إلى المواقع المعتمدة عبر Google Maps.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">

                      {/* عرفات */}
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
                            موقع الوقوف بعرفة (يوم عرفة)
                          </p>

                          <span className="inline-block text-sm font-semibold text-blue-600 group-hover:underline">
                            فتح في الخرائط →
                          </span>
                        </div>
                      </a>

                      {/* مزدلفة */}
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
                            فتح في الخرائط →
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
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
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
      description={`يرجى اختيار الوقت المعتمد لـ ${section.subtitle}.`}
    >
      <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
        السعة القصوى لكل فوج: <span className="font-bold">{MAX_CAPACITY}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {section.times.map((time) => {
          const used = occupancy[`${section.id}__${time}`] || 0;
          const remaining = MAX_CAPACITY - used;
          const isFull = remaining <= 0;

          return (
            <button
              key={time}
              disabled={isFull}
              onClick={() => onSelect(time)}
              className={`${cardClass(
                selectedValue === time
              )} p-5 text-right disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{time}</p>
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