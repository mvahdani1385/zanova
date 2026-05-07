"use client"

import { getToken, logout } from "../../../utils/auth"
import { useState, useEffect } from "react"

interface User {
    id: number
    firstName: string
    lastName: string
    phone: string
    job: string | null
    address: string | null
    description: string | null
    role: string
    createdAt: string
}

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterRole, setFilterRole] = useState("")
    const [message, setMessage] = useState("")

    // پاپ‌آپ
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        job: "",
        address: "",
        description: "",
        role: "user",
        password: ""
    })

    // دریافت کاربران
    const fetchUsers = async () => {
        setLoading(true)
        try {
            const token = getToken()
            const res = await fetch("/api/users", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.status === 401) {
                logout()
                return
            }

            const data = await res.json()
            if (res.ok) {
                setUsers(data)
            }
        } catch (error) {
            setMessage("❌ خطا در دریافت کاربران")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // باز کردن پاپ‌آپ برای نمایش/ویرایش
    const openUserModal = (user: User, edit: boolean = false) => {
        setSelectedUser(user)
        setEditMode(edit)
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            job: user.job || "",
            address: user.address || "",
            description: user.description || "",
            role: user.role,
            password: ""
        })
        setShowModal(true)
    }

    // بستن پاپ‌آپ
    const closeModal = () => {
        setShowModal(false)
        setSelectedUser(null)
        setEditMode(false)
        setFormData({
            firstName: "",
            lastName: "",
            phone: "",
            job: "",
            address: "",
            description: "",
            role: "user",
            password: ""
        })
    }

    // تغییرات فرم
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // ذخیره ویرایش
    const handleSave = async () => {
        if (!selectedUser) return

        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedUser.id,
                    ...formData
                })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage("✅ کاربر با موفقیت ویرایش شد")
                fetchUsers()
                closeModal()
                setTimeout(() => setMessage(""), 3000)
            } else {
                setMessage(`❌ ${data.error}`)
            }
        } catch (error) {
            setMessage("❌ خطا در ویرایش کاربر")
        }
    }

    // حذف کاربر
    const deleteUser = async (id: number, name: string) => {
        if (!confirm(`آیا از حذف کاربر "${name}" مطمئن هستید؟`)) return

        try {
            const res = await fetch(`/api/users?id=${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setMessage("✅ کاربر با موفقیت حذف شد")
                fetchUsers()
                setTimeout(() => setMessage(""), 3000)
            } else {
                setMessage("❌ خطا در حذف کاربر")
            }
        } catch (error) {
            setMessage("❌ خطا در حذف کاربر")
        }
    }

    // فیلتر کاربران
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName.includes(search) ||
            user.lastName.includes(search) ||
            user.phone.includes(search)
        const matchesRole = filterRole === "" || user.role === filterRole
        return matchesSearch && matchesRole
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* هدر */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
                        <p className="text-gray-600 mt-2">مشاهده، جستجو و مدیریت کاربران سیستم</p>
                    </div>
                    <a href="/admin/users">
                        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                            ➕ افزودن کاربر جدید
                        </button>
                    </a>
                </div>

                {/* پیام */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg ${message.includes("✅")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}>
                        {message}
                    </div>
                )}

                {/* فیلترها */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="جستجو بر اساس نام، نام خانوادگی یا شماره تماس..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        >
                            <option value="">همه نقش‌ها</option>
                            <option value="owner">👑 مالک</option>
                            <option value="admin">⚙️ ادمین</option>
                            <option value="seller">🛒 فروشنده</option>
                        </select>
                    </div>
                </div>

                {/* کارت آمار */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                        <div className="text-gray-600 mt-1">کل کاربران</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-yellow-600">
                            {users.filter(u => u.role === "owner").length}
                        </div>
                        <div className="text-gray-600 mt-1">مالک</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-purple-600">
                            {users.filter(u => u.role === "admin").length}
                        </div>
                        <div className="text-gray-600 mt-1">ادمین‌ها</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-blue-600">
                            {users.filter(u => u.role === "seller").length}
                        </div>
                        <div className="text-gray-600 mt-1">فروشنده‌ها</div>
                    </div>
                </div>

                {/* جدول کاربران */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">در حال بارگذاری...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>هیچ کاربری یافت نشد</p>
                            <a href="/admin/users" className="text-blue-600 hover:underline mt-2 inline-block">
                                برای افزودن کاربر جدید کلیک کنید
                            </a>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام و نام خانوادگی</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره تماس</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شغل</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نقش</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ ثبت</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono">{user.phone}</td>
                                            <td className="px-6 py-4 text-sm">{user.job || "-"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === "owner"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : user.role === "admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-blue-100 text-blue-800"
                                                    }`}>
                                                    {user.role === "owner" && "👑 مالک"}
                                                    {user.role === "admin" && "⚙️ ادمین"}
                                                    {user.role === "seller" && "🛒 فروشنده"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                                            </td>
                                            <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                                {user.role !== "owner" && (
                                                    <>
                                                        <button
                                                            onClick={() => openUserModal(user, false)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                                                        >
                                                            👁️ نمایش
                                                        </button>
                                                        <button
                                                            onClick={() => openUserModal(user, true)}
                                                            className="text-green-600 hover:text-green-800 text-sm ml-2"
                                                        >
                                                            ✏️ ویرایش
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                        >
                                                            🗑️ حذف
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* مودال پاپ‌آپ برای نمایش/ویرایش کاربر */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editMode ? "✏️ ویرایش کاربر" : "👤 اطلاعات کاربر"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {!editMode ? (
                                // حالت نمایش
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs text-gray-500">نام</div>
                                            <div className="font-medium">{selectedUser.firstName}</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="text-xs text-gray-500">نام خانوادگی</div>
                                            <div className="font-medium">{selectedUser.lastName}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">شماره تماس</div>
                                        <div className="font-medium font-mono">{selectedUser.phone}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">شغل</div>
                                        <div className="font-medium">{selectedUser.job || "-"}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">آدرس</div>
                                        <div className="font-medium">{selectedUser.address || "-"}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">توضیحات</div>
                                        <div className="font-medium">{selectedUser.description || "-"}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">نقش</div>
                                        <div className="font-medium">
                                            {selectedUser.role === "admin" ? "ادمین" : "کاربر عادی"}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">تاریخ ثبت</div>
                                        <div className="font-medium">
                                            {new Date(selectedUser.createdAt).toLocaleDateString("fa-IR")}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // حالت ویرایش
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">نام *</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">نام خانوادگی *</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">شماره تماس *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 font-mono"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">شغل</label>
                                        <input
                                            type="text"
                                            name="job"
                                            value={formData.job}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">آدرس</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">توضیحات</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">نقش</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="user">کاربر عادی</option>
                                            <option value="admin">ادمین</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            رمز عبور جدید (در صورت تمایل به تغییر)
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="برای عدم تغییر، خالی بگذارید"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                {editMode ? "انصراف" : "بستن"}
                            </button>
                            {editMode && (
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                >
                                    💾 ذخیره تغییرات
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}