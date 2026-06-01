export default function Page() {
  const items = [
    {
      title: "إعداد قاعدة المعرفة",
      body: "أضف ملفات وإجابات موثوقة من صفحة قاعدة المعرفة حتى يعتمد مساعدي على محتوى صحيح ومحدث.",
    },
    {
      title: "متابعة المحادثات",
      body: "راجع محادثات المستخدمين بشكل دوري وحدد الأسئلة التي تحتاج تحسين في الردود أو إضافة مصادر جديدة.",
    },
    {
      title: "الأسئلة غير المجابة",
      body: "استخدم صفحة الأسئلة التي لم يتم الرد عليها لإضافة إجابات مباشرة أو تحويلها إلى ملفات معرفة جديدة.",
    },
    {
      title: "اختبار الردود",
      body: "بعد أي تعديل في المعرفة، اختبر نفس السؤال بصيغ مختلفة للتأكد من أن الرد مفهوم ودقيق.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-2">مساعدي</p>
        <h1 className="mt-2 text-2xl font-semibold text-blue-4">تعليمات استخدام مساعدي</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-2">
          هذه الصفحة تجمع التعليمات الأساسية لإدارة مساعدي، وتمنع وصول الأدمن إلى صفحة غير موجودة عند فتح رابط التعليمات.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <section key={item.title} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-blue-4">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-gray-2">{item.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
