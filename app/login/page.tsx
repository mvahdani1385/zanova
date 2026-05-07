"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        phone: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        console.log("1. شروع درخواست لاگین با:", { phone: formData.phone })

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            console.log("2. پاسخ دریافت شد:", res.status)

            const data = await res.json()
            console.log("3. دیتا:", data)

            // بعد از دریافت پاسخ موفق
            if (res.ok) {
                console.log("4. لاگین موفق - ذخیره توکن")

                // ذخیره در localStorage
                localStorage.setItem("token", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))

                // ذخیره در Cookie (برای middleware)
                // مهم: باید از طریق API یا document.cookie ست بشه
                const currentDomain = window.location.hostname
                document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; domain=${currentDomain}`

                console.log("5. نقش کاربر:", data.user.role)

                let redirectUrl = "/admin"
                if (data.user.role === "owner" || data.user.role === "admin") {
                    redirectUrl = "/admin"
                }

                console.log("6. هدایت به:", redirectUrl)

                // هدایت
                window.location.href = redirectUrl
            } else {
                console.log("7. خطا:", data.error)
                setError(data.error || "خطا در ورود")
            }
        } catch (error) {
            console.error("8. خطای شبکه:", error)
            setError("خطا در ارتباط با سرور")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl shadow-lg mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">ورود به حساب</h1>
                    <p className="mt-2 text-gray-600">برای دسترسی به پنل خود وارد شوید</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                شماره تماس
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                رمز عبور
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    در حال ورود...
                                </span>
                            ) : (
                                "ورود به سیستم"
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>برای تست با حساب مالک وارد شوید:</p>
                    <p className="font-mono mt-1">شماره: 09932169402 | رمز: 123456</p>
                </div>
            </div>
        </div>
    )
}