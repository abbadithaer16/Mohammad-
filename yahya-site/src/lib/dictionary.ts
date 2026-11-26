import type { Lang, Weekday } from './types';

/**
 * Interface text (buttons, labels, headings, form messages).
 * Business content is in site.config.ts. To add English later, add an `en` object
 * with the same keys (TypeScript will list anything missing).
 */
const ar = {
  skip: 'انتقل إلى المحتوى',
  nav: { about: 'عن المركز', services: 'الخدمات', models: 'الموديلات', reviews: 'التقييمات', location: 'الموقع' },
  mainNav: 'القائمة الرئيسية',
  menu: 'فتح القائمة',
  closeMenu: 'إغلاق القائمة',
  home: 'الصفحة الرئيسية',
  book: 'احجز موعد',
  bookShort: 'احجز',
  bookWhatsApp: 'احجز على واتساب',
  callNow: 'اتصل الآن',
  call: 'اتصال',
  whatsapp: 'واتساب',
  directions: 'الاتجاهات',
  quickContact: 'تواصل سريع',
  newTab: '(يفتح في نافذة جديدة)',
  generalMessage: 'مرحباً، أود حجز موعد لسيارتي.',
  serviceMessage: (service: string) => `مرحباً، أود الاستفسار عن: ${service}`,
  trust: { onGoogle: 'على Google', reviews: 'تقييم' },
  about: { eyebrow: 'عن المركز', engineer: 'المهندس المسؤول' },
  services: { eyebrow: 'ماذا نقدّم', title: 'خدماتنا', ask: 'اسأل على واتساب' },
  models: { eyebrow: 'الموديلات التي نخدمها' },
  gallery: { eyebrow: 'معرض الصور', title: 'من المركز' },
  reviews: {
    eyebrow: 'آراء زبائننا',
    title: 'ماذا يقول زبائننا',
    google: 'شوف كل التقييمات على Google',
    fromGoogle: 'من تقييمات Google',
    stars: (n: number) => `${n} من 5 نجوم`,
  },
  location: {
    eyebrow: 'زورونا',
    title: 'الموقع وساعات الدوام',
    address: 'العنوان',
    hours: 'ساعات الدوام',
    phone: 'الهاتف وواتساب',
    closed: 'مغلق',
    map: (name: string) => `خريطة موقع ${name} على Google Maps`,
    openMap: 'افتح الموقع على Google Maps',
  },
  booking: {
    eyebrow: 'احجز موعدك',
    title: 'احجز موعدك على واتساب',
    intro: 'عبّئ البيانات، وسيفتح واتساب برسالة جاهزة تصل مباشرة للمركز.',
    name: 'الاسم',
    phone: 'رقم الهاتف',
    phonePlaceholder: '07XXXXXXXX',
    car: 'نوع السيارة',
    carPlaceholder: 'مثال: Kia Niro',
    year: 'سنة الصنع',
    yearPlaceholder: 'مثال: 2019',
    optional: 'اختياري',
    service: 'الخدمة',
    other: 'أخرى',
    choose: 'اختر',
    submit: 'أرسل على واتساب',
    privacy: 'تُرسل بياناتك مباشرة على واتساب، ولا يُحفظ أي شيء على الموقع.',
    sent: 'سيفتح واتساب الآن برسالتك. إذا لم يفتح، اضغط على الرابط:',
    openAgain: 'افتح واتساب',
    errors: {
      name: 'اكتب اسمك من فضلك.',
      phoneEmpty: 'اكتب رقم هاتفك من فضلك.',
      phone: 'رقم الهاتف غير صحيح. اكتبه بهذا الشكل: 0791234567',
      car: 'اكتب نوع سيارتك من فضلك.',
      year: (max: number) => `سنة الصنع يجب أن تكون بين 1990 و${max}.`,
      service: 'اختر الخدمة من القائمة.',
      summary: 'بعض الحقول بحاجة لتعديل، راجع الملاحظات تحت كل حقل.',
    },
    message: {
      hello: 'مرحباً، أود حجز موعد.',
      name: 'الاسم',
      phone: 'رقم الهاتف',
      car: 'السيارة',
      year: 'سنة الصنع',
      service: 'الخدمة',
    },
  },
  footer: { contact: 'تواصل معنا', hours: 'ساعات الدوام' },
  notFound: { title: 'الصفحة غير موجودة', text: 'الرابط الذي فتحته غير صحيح أو تم نقله.', home: 'العودة إلى الصفحة الرئيسية' },
  weekdays: {
    sat: 'السبت',
    sun: 'الأحد',
    mon: 'الاثنين',
    tue: 'الثلاثاء',
    wed: 'الأربعاء',
    thu: 'الخميس',
    fri: 'الجمعة',
  } satisfies Record<Weekday, string>,
};

export type Dictionary = typeof ar;

const dictionaries: Partial<Record<Lang, Dictionary>> = { ar };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? ar;
}
