"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-3xl px-6 text-center">

        {/* Logo */}
        <img
          src="/logo.png"
          alt="شعار الشركة"
          className="mx-auto mb-6 h-28 w-auto"
        />

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          بوابة تسجيل الحجاج
        </h1>

        {/* Description Box */}
        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
          <p className="text-base md:text-lg leading-8 text-slate-700">
            منصة مخصصة لتنظيم مواعيد تنقل الحجاج وأداء المناسك وفق الجداول
            المعتمدة من وزارة الحج والعمرة، بما يضمن انسيابية الحركة
            وسهولة الالتزام بالأوقات المحددة خلال الرحلة.
          </p>
        </div>

        {/* Button */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-12 py-5 text-xl font-bold text-white shadow-xl shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:scale-105"
          >
            ابدأ التسجيل
          </Link>
        </div>

      </div>
    </div>
  );
}