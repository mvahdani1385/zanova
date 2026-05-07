"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    job: "",
    address: "",
    password: "",
    confirmPassword: "",
    description: "",
    role: "seller"
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // State برای نمایش/مخفی کردن رمز
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // اعتبارسنجی تطابق رمز عبور
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ رمز عبور و تکرار آن مطابقت ندارند")
      return
    }
    
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          job: formData.job,
          address: formData.address,
          password: formData.password,
          description: formData.description,
          role: formData.role
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("✅ کاربر با موفقیت ساخته شد")
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          job: "",
          address: "",
          password: "",
          confirmPassword: "",
          description: "",
          role: "seller"
        })
        setShowPassword(false)
        setShowConfirmPassword(false)
        
        // بعد از 2 ثانیه به صفحه مدیریت کاربران برو
        setTimeout(() => {
          router.push("/admin/manage-users")
        }, 2000)
      } else {
        setMessage(`❌ خطا: ${data.error}`)
      }
    } catch (error) {
      setMessage("❌ خطا در ارتباط با سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* هدر */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ایجاد کاربر جدید</h1>
          <p className="mt-2 text-gray-600">اطلاعات کاربر را وارد کنید</p>
        </div>

        {/* پیام */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border-r-4 ${
            message.includes("✅") 
              ? "bg-green-50 border-green-500 text-green-800" 
              : "bg-red-50 border-red-500 text-red-800"
          }`}>
            <div className="flex items-center">
              <span className="text-2xl ml-3">{message.includes("✅") ? "✓" : "!"}</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* فرم */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* ردیف اول: نام و نام خانوادگی */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نام <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="علی"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نام خانوادگی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="محمدی"
                />
              </div>
            </div>

            {/* شماره تماس */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                شماره تماس (نام کاربری) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-mono"
                placeholder="09123456789"
              />
            </div>

            {/* رمز عبور با چشم */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رمز عبور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* تکرار رمز عبور با چشم */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تکرار رمز عبور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* شغل */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                شغل
              </label>
              <input
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                placeholder="طراح وب، برنامه‌نویس، ..."
              />
            </div>

            {/* آدرس */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                آدرس
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                placeholder="تهران، خیابان آزادی، ..."
              />
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                توضیحات
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                placeholder="اطلاعات تکمیلی درباره کاربر..."
              />
            </div>

            {/* نقش */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نقش کاربری
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
              >
                <option value="seller">🛒 فروشنده</option>
                <option value="admin">⚙️ ادمین</option>
                {/* <option value="owner">👑 مالک</option> */}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                توجه: نقش مالک فقط یک بار قابل ایجاد است
              </p>
            </div>
          </div>

          {/* دکمه submit */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ایجاد...
                </span>
              ) : (
                "✨ ایجاد کاربر"
              )}
            </button>
          </div>
        </form>

        {/* فوتر */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>فیلدهای دارای <span className="text-red-500">*</span> اجباری هستند</p>
        </div>
      </div>
    </div>
  )
}