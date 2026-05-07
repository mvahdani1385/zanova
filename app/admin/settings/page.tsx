"use client"

import { useState, useEffect } from "react"

export default function SettingsPage() {
    const [domain, setDomain] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        // دریافت تنظیمات فعلی
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => setDomain(data.domain))
            .catch(err => console.error(err))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage("✅ دامنه با موفقیت تغییر کرد")
                // به روزرسانی environment variable در سمت سرور
                await fetch("/api/update-domain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ domain })
                })
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">تنظیمات دامنه</h1>
                    <p className="mt-2 text-gray-600">آدرس دامنه برای ساخت QR Code ها</p>
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

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            آدرس دامنه
                        </label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                            dir="ltr"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            مثال: http://localhost:3000 یا https://mydomain.com
                        </p>
                        <p className="mt-1 text-sm text-blue-600">
                            QR Code ها به آدرس: {domain}/verify/[CODE] لینک می‌شوند
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                    </button>
                </form>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ راهنما:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• دامنه فعلی: {domain}</li>
                        <li>• بعد از تغییر دامنه، کدهای جدید با دامنه جدید ساخته می‌شوند</li>
                        <li>• کدهای قبلی با دامنه قدیمی باقی می‌مانند</li>
                        <li>• می‌توانید بعداً دامنه را هر بار که خواستید تغییر دهید</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}