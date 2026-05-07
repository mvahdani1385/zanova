"use client"

import Link from "next/link"
import { useState } from "react"

export default function GenerateCodesPage() {
    const [formData, setFormData] = useState({
        codeLength: 10,
        codeType: "alphanumeric",
        numberOfCodes: 100,
        batchName: ""
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [xmlData, setXmlData] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")
        setXmlData("")

        try {
            const res = await fetch("/api/generate-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codeLength: parseInt(formData.codeLength.toString()),
                    codeType: formData.codeType,
                    numberOfCodes: parseInt(formData.numberOfCodes.toString()),
                    batchName: formData.batchName
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage(`✅ ${data.message}`)

                // دانلود خودکار فایل XML
                const blob = new Blob([data.xml], { type: "application/xml" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `codes_${data.batchId}.xml`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            } else {
                setMessage(`❌ ${data.error}`)
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7v6m0 0v6m0-6h6m-6 0H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">تولید کدهای تصادفی</h1>
                    <p className="mt-2 text-gray-600">کدهای یکتا و بدون تکرار تولید کنید</p>
                    // اضافه کن به هدر صفحه
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">تولید کدهای تصادفی</h1>
                            <p className="text-gray-600 mt-2">تولید کدهای یکتا همراه با QR Code</p>
                        </div>
                        <Link href="/admin/manage-codes">
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                                📋 مدیریت کدها
                            </button>
                        </Link>
                    </div>
                </div>

                {/* پیام */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg border-r-4 ${message.includes("✅")
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
                        {/* طول کد */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                طول کد (۵ تا ۲۰ رقم)
                            </label>
                            <input
                                type="range"
                                name="codeLength"
                                min="5"
                                max="20"
                                value={formData.codeLength}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-center mt-2">
                                <span className="text-2xl font-bold text-gray-900">{formData.codeLength}</span>
                                <span className="text-gray-600"> رقم</span>
                            </div>
                        </div>

                        {/* نوع کاراکترها */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                نوع کاراکترها
                            </label>
                            <select
                                name="codeType"
                                value={formData.codeType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                            >
                                <option value="numbers">🔢 فقط اعداد (0-9)</option>
                                <option value="letters">🔤 فقط حروف انگلیسی (A-Z, a-z)</option>
                                <option value="alphanumeric">📚 حروف + اعداد</option>
                                <option value="mixed">🎲 ترکیبی (حروف + اعداد + نمادها)</option>
                            </select>
                        </div>

                        {/* تعداد کدها */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                تعداد کدها (۱ تا ۱۰۰,۰۰۰)
                            </label>
                            <input
                                type="number"
                                name="numberOfCodes"
                                value={formData.numberOfCodes}
                                onChange={handleChange}
                                min="1"
                                max="100000"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                                placeholder="مثلاً ۱۰۰۰"
                            />
                        </div>

                        {/* نام دسته */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                نام دسته (اختیاری)
                            </label>
                            <input
                                type="text"
                                name="batchName"
                                value={formData.batchName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                                placeholder="مثلاً کدهای تخفیف نوروز ۱۴۰۴"
                            />
                        </div>

                        {/* اطلاعات آماری */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">اطلاعات آماری:</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• طول کد: {formData.codeLength} رقم</p>
                                <p>• نوع کاراکترها: {
                                    formData.codeType === "numbers" ? "اعداد" :
                                        formData.codeType === "letters" ? "حروف انگلیسی" :
                                            formData.codeType === "alphanumeric" ? "حروف + اعداد" : "ترکیبی کامل"
                                }</p>
                                <p>• تعداد کدها: {parseInt(formData.numberOfCodes.toString()).toLocaleString()} عدد</p>
                            </div>
                        </div>
                    </div>

                    {/* دکمه submit */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
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
                                    در حال تولید کدها...
                                </span>
                            ) : (
                                "✨ تولید کدها و دانلود فایل XML"
                            )}
                        </button>
                    </div>
                </form>

                {/* فوتر */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>کدهای تولید شده یکتا بوده و در دیتابیس ذخیره می‌شوند</p>
                </div>
            </div>
        </div>
    )
}