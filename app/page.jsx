"use client";

import Link from "next/link";
import { Bus, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 md:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <Bus className="h-4 w-4" />
              منصة تنظيم الحجاج
            </div>

            <div className="space-y-4">
              <img
                src="/logo.png"
                alt="شعار الشركة"
                className="h-20 w-auto"
              />

              <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                بوابة تسجيل الحجاج
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                منصة مخصصة لتسجيل بيانات الحجاج واختيار يوم ووقت الرحلة وفق
                المقاعد المتاحة، مع تجربة استخدام واضحة واحترافية تدعم سهولة
                التنظيم ورفع كفاءة التشغيل.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
              >
                ابدأ التسجيل
              </Link>

              <Link
                href="/admin"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                لوحة التشغيل
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-5">
              <div className="rounded-2xl bg-blue-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  خدمات المنصة
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                  <li>• تسجيل بيانات الحاج بطريقة مبسطة وواضحة</li>
                  <li>• اختيار اليوم والفترة الزمنية المناسبة</li>
                  <li>• تنظيم المقاعد حسب سعة كل حافلة</li>
                  <li>• عرض تشغيلي حيّ للركاب حسب الموعد</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      مخصصة للتسجيل والتنظيم
                    </p>
                    <p className="text-sm text-slate-500">
                      واجهة منفصلة للحجاج ولوحة مستقلة لفريق التشغيل.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-white to-blue-50 p-5">
                <p className="text-sm text-slate-500">السعة المعتمدة لكل فوج</p>
                <p className="mt-2 text-3xl font-bold text-blue-700">
                  188 حاج
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}