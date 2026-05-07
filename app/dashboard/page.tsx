"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getToken, updateCurrentUser, logout } from "../../utils/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // پاپ‌آپ
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    job: "",
    address: "",
    description: "",
    password: "",
    confirmPassword: ""
  })
  const [message, setMessage] = useState("")
  const [updating, setUpdating] = useState(false)
  
  // State برای نمایش/مخفی کردن رمز
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    const token = getToken()
    
    if (!currentUser || !token) {
      router.push("/login")
    } else {
      setUser(currentUser)
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        job: currentUser.job || "",
        address: currentUser.address || "",
        description: currentUser.description || "",
        password: "",
        confirmPassword: ""
      })
      setLoading(false)
    }
  }, [])

  // باز کردن پاپ‌آپ ویرایش
  const openEditModal = () => {
    setEditMode(true)
    setShowModal(true)
    setMessage("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      job: user.job || "",
      address: user.address || "",
      description: user.description || "",
      password: "",
      confirmPassword: ""
    })
  }

  // بستن پاپ‌آپ
  const closeModal = () => {
    setShowModal(false)
    setEditMode(false)
    setMessage("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      job: user.job || "",
      address: user.address || "",
      description: user.description || "",
      password: "",
      confirmPassword: ""
    })
  }

  // تغییرات فرم
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // اعتبارسنجی و ذخیره
  const handleSave = async () => {
    // چک کردن تطابق رمز عبور
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ رمز عبور و تکرار آن مطابقت ندارند")
      return
    }

    setUpdating(true)
    setMessage("")

    try {
      const token = getToken()
      const res = await fetch("/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          job: formData.job,
          address: formData.address,
          description: formData.description,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        updateCurrentUser(data.user, data.token)
        setUser(data.user)
        setMessage("✅ اطلاعات با موفقیت بروزرسانی شد")
        
        setTimeout(() => {
          closeModal()
        }, 1500)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage("❌ خطا در ارتباط با سرور")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* هدر */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-900 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">داشبورد کاربری</h1>
                <p className="text-gray-300 mt-1">به پنل کاربری خود خوش آمدید</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                خروج
              </button>
            </div>
          </div>

          {/* اطلاعات کاربری */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">اطلاعات شخصی</h2>
              <button
                onClick={openEditModal}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                ویرایش اطلاعات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">نام</div>
                <div className="text-lg font-medium text-gray-900 mt-1">{user.firstName}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">نام خانوادگی</div>
                <div className="text-lg font-medium text-gray-900 mt-1">{user.lastName}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">شماره تماس</div>
                <div className="text-lg font-medium text-gray-900 mt-1 font-mono">{user.phone}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">نقش</div>
                <div className="text-lg font-medium text-gray-900 mt-1">
                  {user.role === "owner" && "👑 مالک"}
                  {user.role === "admin" && "⚙️ ادمین"}
                  {user.role === "seller" && "🛒 فروشنده"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">شغل</div>
                <div className="text-lg font-medium text-gray-900 mt-1">{user.job || "ثبت نشده"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <div className="text-sm text-gray-500">آدرس</div>
                <div className="text-lg font-medium text-gray-900 mt-1">{user.address || "ثبت نشده"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <div className="text-sm text-gray-500">توضیحات</div>
                <div className="text-lg font-medium text-gray-900 mt-1">{user.description || "ثبت نشده"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال پاپ‌آپ ویرایش */}
      {showModal && editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">✏️ ویرایش اطلاعات</h2>
              <button
                onClick={closeModal}
                disabled={updating}
                className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes("✅") 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      نام *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    شغل
                  </label>
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    placeholder="مثال: برنامه‌نویس، طراح، ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    آدرس
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                    placeholder="آدرس کامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    توضیحات
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                    placeholder="توضیحات اضافی..."
                  />
                </div>

                {/* رمز عبور جدید با چشم */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    رمز عبور جدید
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      placeholder="برای عدم تغییر خالی بگذارید"
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
                  <p className="mt-1 text-xs text-gray-500">
                    فقط در صورت تمایل به تغییر رمز، مقدار جدید را وارد کنید
                  </p>
                </div>

                {/* تکرار رمز عبور با چشم */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    تکرار رمز عبور جدید
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                      placeholder="رمز عبور جدید را دوباره وارد کنید"
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
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={updating}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ذخیره تغییرات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}