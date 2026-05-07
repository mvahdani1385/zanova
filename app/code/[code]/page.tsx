"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"

interface PageProps {
    params: Promise<{ code: string }>
}

export default function CodeInfoPage({ params }: PageProps) {
    // در کامپوننت Client Component باید از React.use استفاده کنیم
    const { code } = use(params)  // این خط مهمه
    const router = useRouter()

    console.log("Page - Code from URL:", code)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [codeData, setCodeData] = useState<any>(null)
    const [message, setMessage] = useState("")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        description: ""
    })

    // دریافت اطلاعات کد
    useEffect(() => {
        if (code) {
            fetchCodeInfo()
        }
    }, [code])

    const fetchCodeInfo = async () => {
        try {
            console.log("Fetching info for code:", code)
            const res = await fetch(`/api/code-info/${code}`)
            const data = await res.json()

            if (res.ok) {
                setCodeData(data.code)
                if (data.code.userFirstName) {
                    setFormData({
                        firstName: data.code.userFirstName || "",
                        lastName: data.code.userLastName || "",
                        phone: data.code.userPhone || "",
                        description: data.code.userDescription || ""
                    })
                }
            } else {
                setMessage("❌ کد نامعتبر است")
                setTimeout(() => router.push("/"), 3000)
            }
        } catch (error) {
            setMessage("❌ خطا در دریافت اطلاعات")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            const res = await fetch(`/api/code-info/${code}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                setMessage("✅ اطلاعات با موفقیت ثبت شد")
                setCodeData(data.code)
                setTimeout(() => {
                    router.push("/dashboard")
                }, 2000)
            } else {
                setMessage(`❌ ${data.error}`)
            }
        } catch (error) {
            setMessage("❌ خطا در ثبت اطلاعات")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">ثبت اطلاعات</h1>
                    <p className="mt-2 text-gray-600">
                        کد: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span>
                    </p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.includes("✅") 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">نام *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">نام خانوادگی *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">شماره تماس *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            dir="ltr"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {saving ? "در حال ثبت..." : "💾 ثبت اطلاعات"}
                    </button>
                </form>
            </div>
        </div>
    )
}