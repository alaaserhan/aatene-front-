"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { format, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Form, FormField } from "@/src/components/ui/form";
import { FormInput } from "@/src/components/ui/FormInput";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetCities } from "@/src/features/(web)/settings/hooks";
import { useLanguage } from "@/src/hooks/use-language";
import { DEFAULT_COUNTRY_CODE, joinPhoneCountryCode } from "@/src/lib/phone";
import { cn } from "@/src/lib/utils";
import { useRegisterMerchant } from "../hooks";
import { loginUrl } from "../links";
import type { ApiError, Gender } from "../types";

/**
 * The backend accepts only "+972XXXXXXXXX" (or "05XXXXXXXX"), so the dial code
 * is fixed — PhoneNumberInput keeps its country picker disabled anyway.
 */
const COUNTRY_CODE = DEFAULT_COUNTRY_CODE;

function toApiPhone(raw: string): string | null {
  const phone = joinPhoneCountryCode(COUNTRY_CODE, raw);
  return /^\+972\d{9}$/.test(phone) ? phone : null;
}

const nameField = (requiredMessage: string) =>
  z.string().trim().min(1, requiredMessage).max(255, "يجب ألا يتجاوز الاسم 255 حرفًا");

const merchantSignupFields = z.object({
  first_name: nameField("الاسم الأول مطلوب"),
  last_name: nameField("الاسم الأخير مطلوب"),
  email: z.string().trim().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .refine((value) => toApiPhone(value) !== null, "أدخل رقم هاتف صحيحًا، مثل 59 123 4567"),
  city_id: z.number({ message: "المدينة مطلوبة" }),
  date_of_birth: z.string().min(1, "تاريخ الميلاد مطلوب"),
  gender: z.enum(["male", "female"], { message: "النوع مطلوب" }),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  password_confirmation: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  terms: z.boolean().refine((value) => value, "يجب الموافقة على سياسة الخصوصية وشروط الاستخدام"),
});

const merchantSignupSchema = merchantSignupFields.refine(
  (data) => data.password === data.password_confirmation,
  { message: "كلمتا المرور غير متطابقتين", path: ["password_confirmation"] },
);

type MerchantSignupValues = z.infer<typeof merchantSignupSchema>;

/** Backend validation keys that map onto a field of this form. */
const FIELD_NAMES = new Set<string>(Object.keys(merchantSignupFields.shape));

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
];

function fieldClass(error?: string, options?: { password?: boolean }) {
  return cn(
    "h-11 rounded-full border-c2-neutral-200 pr-5 text-sm placeholder:text-c2-neutral-450 focus:border-c2-navy-600",
    options?.password ? "pl-11" : "pl-5",
    error && "border-c2-danger focus:border-c2-danger",
  );
}

function FieldShell({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm text-c2-neutral-700">
        {label}
        <span className="mr-1 text-c2-danger">*</span>
      </label>
      {children}
      {error && <p className="text-xs text-c2-danger">{error}</p>}
    </div>
  );
}

export function MerchantSignupForm() {
  const lang = useLanguage();
  const [citySearch, setCitySearch] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<MerchantSignupValues>({
    resolver: zodResolver(merchantSignupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      password: "",
      password_confirmation: "",
      terms: false,
    },
  });

  const { data: citiesData, isLoading: isLoadingCities } = useGetCities({ per_page: 1000 });
  const cityOptions = useMemo(() => {
    const query = citySearch.trim();
    return (citiesData?.cities ?? [])
      .filter((city) => !query || city.name.includes(query))
      .map((city) => ({ value: String(city.id), label: city.name }));
  }, [citiesData, citySearch]);

  // `isSuccess` keeps the loading state until the redirect unmounts the form.
  const { mutate: registerMerchant, isPending, isSuccess } = useRegisterMerchant();
  const isSubmitting = isPending || isSuccess;

  const onSubmit = (values: MerchantSignupValues) => {
    registerMerchant(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: toApiPhone(values.phone) ?? values.phone,
        city_id: values.city_id,
        date_of_birth: values.date_of_birth,
        gender: values.gender,
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      {
        onError: (error) => {
          form.clearErrors();
          if (!(error instanceof AxiosError)) {
            toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
            return;
          }

          const responseData = error.response?.data as ApiError | undefined;
          const fieldErrors = Object.entries(responseData?.errors ?? {});
          let unmatched: string | undefined;

          fieldErrors.forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : undefined;
            if (!message) return;
            if (FIELD_NAMES.has(field)) {
              form.setError(field as keyof MerchantSignupValues, { type: "server", message });
            } else {
              unmatched ??= message;
            }
          });

          const rootMessage = unmatched ?? (fieldErrors.length === 0 ? responseData?.message : undefined);
          if (rootMessage) form.setError("root", { message: rootMessage });
        },
      },
    );
  };

  const errors = form.formState.errors;

  return (
    <div className="w-full max-w-xl rounded-2xl border border-c2-neutral-200 bg-white p-5 sm:p-7" dir="rtl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <FormInput
                  label="الاسم الأول"
                  placeholder="أدخل اسمك الأول"
                  autoComplete="given-name"
                  required
                  error={fieldState.error?.message}
                  className={fieldClass(fieldState.error?.message)}
                  containerClassName="space-y-2"
                  {...field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field, fieldState }) => (
                <FormInput
                  label="الاسم الأخير"
                  placeholder="أدخل اسمك الأخير"
                  autoComplete="family-name"
                  required
                  error={fieldState.error?.message}
                  className={fieldClass(fieldState.error?.message)}
                  containerClassName="space-y-2"
                  {...field}
                />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormInput
                label="البريد الإلكتروني"
                type="email"
                dir="ltr"
                placeholder="أدخل بريدك الإلكتروني"
                autoComplete="email"
                required
                error={fieldState.error?.message}
                className={cn(fieldClass(fieldState.error?.message), "text-right")}
                containerClassName="space-y-2"
                {...field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <PhoneNumberInput
                label="رقم الهاتف"
                placeholder="59 123 4567"
                autoComplete="tel-national"
                inputMode="tel"
                required
                countryCode={COUNTRY_CODE}
                onCountryCodeChange={() => {}}
                error={fieldState.error?.message}
                roundedFull
                height="h-11"
                className="ps-3 text-left placeholder:text-c2-neutral-450"
                {...field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="city_id"
            render={({ field, fieldState }) => (
              <FieldShell label="المدينة">
                <ReusableDropdown
                  options={cityOptions}
                  value={field.value ? String(field.value) : ""}
                  onChange={(value: string) => field.onChange(Number(value))}
                  placeholder={isLoadingCities ? "جارٍ التحميل..." : "اختر المدينة"}
                  onSearch={setCitySearch}
                  searchPlaceholder="ابحث عن مدينة..."
                  error={fieldState.error?.message}
                  triggerClassName={cn(
                    "h-11 rounded-full border-c2-neutral-200 px-5",
                    fieldState.error && "border-c2-danger",
                  )}
                />
              </FieldShell>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field, fieldState }) => (
              <FieldShell label="تاريخ الميلاد" htmlFor="date_of_birth" error={fieldState.error?.message}>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      id="date_of_birth"
                      type="button"
                      className={cn(
                        "flex h-11 w-full cursor-pointer items-center justify-between rounded-full border bg-white px-5 text-sm transition-colors hover:bg-c2-neutral-50 focus:outline-none",
                        fieldState.error ? "border-c2-danger" : "border-c2-neutral-200",
                      )}
                    >
                      {field.value ? (
                        <span dir="ltr">{format(new Date(`${field.value}T00:00:00`), "yyyy/MM/dd")}</span>
                      ) : (
                        <span className="text-c2-neutral-450">اختر تاريخ ميلادك</span>
                      )}
                      <CalendarIcon className="size-4 text-c2-neutral-450" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-0 p-0 shadow-none" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        field.onChange(format(date, "yyyy-MM-dd"));
                        setIsDatePickerOpen(false);
                      }}
                      toYear={new Date().getFullYear()}
                      disabled={(date) => date >= startOfToday()}
                    />
                  </PopoverContent>
                </Popover>
              </FieldShell>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field, fieldState }) => (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm text-c2-neutral-700">
                  النوع
                  <span className="mr-1 text-c2-danger">*</span>
                </legend>
                <div className="flex items-center gap-6">
                  {GENDER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 text-sm text-c2-neutral-900"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        onBlur={field.onBlur}
                        className="size-4 cursor-pointer accent-c2-primary"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {fieldState.error && <p className="text-xs text-c2-danger">{fieldState.error.message}</p>}
              </fieldset>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormInput
                label="كلمة المرور"
                type="password"
                placeholder="6 أحرف على الأقل"
                autoComplete="new-password"
                required
                error={fieldState.error?.message}
                className={fieldClass(fieldState.error?.message, { password: true })}
                containerClassName="space-y-2"
                {...field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field, fieldState }) => (
              <FormInput
                label="تأكيد كلمة المرور"
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                autoComplete="new-password"
                required
                error={fieldState.error?.message}
                className={fieldClass(fieldState.error?.message, { password: true })}
                containerClassName="space-y-2"
                {...field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="merchant-terms"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    className="size-4 border-c2-neutral-200 shadow-none data-[state=checked]:border-c2-primary data-[state=checked]:bg-c2-primary [&_svg]:size-3"
                  />
                  <label htmlFor="merchant-terms" className="cursor-pointer text-xs leading-relaxed text-c2-neutral-500">
                    لقد قرأت ووافقت على{" "}
                    <Link
                      href={`/${lang}/privacy-policy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-c2-navy-600 underline underline-offset-2"
                    >
                      سياسة الخصوصية
                    </Link>{" "}
                    و
                    <Link
                      href={`/${lang}/terms-of-use`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-c2-navy-600 underline underline-offset-2"
                    >
                      شروط الاستخدام
                    </Link>
                  </label>
                </div>
                {fieldState.error && <p className="text-xs text-c2-danger">{fieldState.error.message}</p>}
              </div>
            )}
          />

          {errors.root && <p className="text-xs text-c2-danger">{errors.root.message}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-full bg-c2-primary text-base font-medium text-white hover:bg-c2-navy-600"
          >
            {isSubmitting ? (
              <>
                جارٍ إنشاء الحساب...
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              "إنشاء الحساب والمتابعة"
            )}
          </Button>

          <p className="text-center text-sm text-c2-neutral-500">
            لديك حساب بالفعل؟{" "}
            <Link
              href={loginUrl(lang, { redirectTo: `/${lang}/admin/stores/add` })}
              className="font-medium text-c2-navy-600 underline-offset-2 hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
