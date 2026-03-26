import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  Flag,
  ChevronDown,
  Calendar,
  Users,
} from "lucide-react";
import { postUpdateProfile, getData } from "@/libs/fetch";
import { useState, useEffect } from "react";
import Notification from "@/components/Notification/Notification";

export default function ProfilePage({
  isEditing,
  setIsEditing,
  profile,
  setProfile,
}) {
  const [updateProfile, setUpdateProfile] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  const getMissingFields = (p) => {
    const missing = [];
    if (!p?.job?.id) missing.push("อาชีพ");
    if (!p?.country?.id) missing.push("ประเทศ");
    if (!p?.city?.id) missing.push("จังหวัด / เมือง");
    return missing;
  };

  const showNotification = (msg, isError = false) => {
    setNotification({
      isVisible: true,
      isError: isError,
      message: msg,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const fetchData = async () => {
    try {
      const resJob = await getData(`users/jobs`);
      const resCountry = await getData(`users/countrys`);

      setJobs(resJob?.data || []);
      setCountries(resCountry?.data || []);

      const countryId = updateProfile?.country?.id || resCountry?.data?.[0]?.id;
      if (countryId) {
        const resCity = await getData(`users/country/${countryId}/citys`);
        setCities(resCity?.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("ไม่สามารถโหลดข้อมูลพื้นฐานได้ กรุณาลองใหม่อีกครั้ง", true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setUpdateProfile(profile);
  }, [profile]);

  const handleChange = (field, value, subField = null) => {
    setUpdateProfile((prev) => {
      if (subField) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subField]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    const missing = getMissingFields(updateProfile);
    if (missing.length > 0) {
      setShowIncompleteModal(true);
      return;
    }
const cleanPayload = {
    firstName: updateProfile.firstName,
    lastName: updateProfile.lastName,
    email: updateProfile.email,
    phone: updateProfile.phone || "",
    address: updateProfile.address || "",
    postCode: updateProfile.postCode || "",
    gender: updateProfile.gender,
    dateOfBirth: updateProfile.dateOfBirth || null,
    job: updateProfile.job?.id ? {
      id: updateProfile.job.id,
      jobNameTh: updateProfile.job.jobNameTh,
      jobNameEn: updateProfile.job.jobNameEn
    } : null,
    
    country: updateProfile.country?.id ? {
      id: updateProfile.country.id,
      countryNameTh: updateProfile.country.countryNameTh,
      countryNameEn: updateProfile.country.countryNameEn
    } : null,
    
    city: updateProfile.city?.id ? {
      id: updateProfile.city.id,
      cityNameTh: updateProfile.city.cityNameTh,
      cityNameEn: updateProfile.city.cityNameEn
    } : null,
  };
    await editData(cleanPayload);
    setIsEditing(false);
    // setTimeout(() => {
    //     window.location.reload();
    // }, 1000);
  };

  const editData = async (data) => {
    try {
      const res = await postUpdateProfile(data);
      if (res.statusCode === 200 || res.statusCode === 201) {
        showNotification("บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวสำเร็จ", false);
      } else {
        // showNotification(res?.message || "ไม่สามารถบันทึกข้อมูลได้", true);
        showNotification("ไม่สามารถบันทึกข้อมูลได้", true);
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง", true);
    }
  };

  const handleCountryChange = async (countryId) => {
    const selectedCountry = countries.find((c) => c.id == countryId);
    handleChange("country", selectedCountry);

    try {
        const resCity = await getData(`users/country/${countryId}/citys`);
        setCities(resCity?.data || []);
        handleChange("city", null);
    } catch (error) {
        showNotification("ไม่สามารถโหลดข้อมูลจังหวัดได้", true);
    }
  };

  const handleCancel = () => {
    setUpdateProfile(profile);
    setIsEditing(false);
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const genderOptions = [
    { id: "M", label: "ชาย" },
    { id: "F", label: "หญิง" },
    { id: "U", label: "เพศที่สาม" },
    { id: "N", label: "ไม่ระบุ" },
  ];

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />

      {/* Incomplete Profile Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800">กรุณากรอกข้อมูลให้ครบถ้วน</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3 ml-[52px]">
              ยังไม่ได้ระบุข้อมูลต่อไปนี้:
            </p>
            <ul className="ml-[52px] mb-5 space-y-1">
              {getMissingFields(updateProfile).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-red-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowIncompleteModal(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all text-sm"
            >
              กลับไปแก้ไข
            </button>
          </div>
        </div>
      )}

      {/* Incomplete profile banner (view mode) */}
      {!isEditing && getMissingFields(profile).length > 0 && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm text-red-600">
            กรุณากรอกข้อมูลให้ครบถ้วน:{" "}
            <span className="font-semibold">{getMissingFields(profile).join(", ")}</span>
          </p>
        </div>
      )}
      
      <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            ข้อมูลบัญชีของฉัน
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            จัดการและแก้ไขข้อมูลส่วนตัวของคุณ
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
          >
            แก้ไขโปรไฟล์
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="flex-shrink-0 flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-purple-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              <User size={60} className="md:w-20 md:h-20 text-purple-300" />
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">เปลี่ยนรูป</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg md:text-xl text-gray-900 break-words max-w-[200px]">
              {profile.firstName} {profile.lastName}
            </h3>
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wide">
              {profile.role || "สมาชิกทั่วไป"}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-6">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="ชื่อ"
                value={updateProfile.firstName}
                onChange={(v) => handleChange("firstName", v)}
                isEditing={isEditing}
                icon={<User size={18} />}
                maxLength={20}
              />
              <InputField
                label="นามสกุล"
                value={updateProfile.lastName}
                onChange={(v) => handleChange("lastName", v)}
                isEditing={isEditing}
                maxLength={20}
              />
            </div>

            <InputField
              label="ที่อยู่อีเมล"
              value={updateProfile.email}
              isEditing={isEditing}
              type="email"
              icon={<Mail size={18} />}
              disabled={true}
            />
            <InputField
              label="เบอร์โทรศัพท์"
              value={updateProfile.phone}
              onChange={(v) => handleChange("phone", v)}
              isEditing={isEditing}
              type="tel"
              icon={<Phone size={18} />}
              maxLength={10}
            />

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                เพศ
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <Users size={18} />
                  </div>
                  <select
                    value={updateProfile.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base appearance-none"
                  >
                    {genderOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
              ) : (
                <div className="w-full pl-10 pr-4 py-2.5 bg-white border-b border-gray-100 text-gray-800 font-medium flex items-center text-sm md:text-base min-h-[44px] relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Users size={18} />
                  </div>
                  {genderOptions.find((g) => g.id === updateProfile.gender)
                    ?.label || "ไม่ระบุ"}
                </div>
              )}
            </div>

            <InputField
              label="วันเดือนปีเกิด"
              value={updateProfile.dateOfBirth}
              onChange={(v) => handleChange("dateOfBirth", v)}
              isEditing={isEditing}
              type="date"
              icon={<Calendar size={18} />}
            />

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                อายุ
              </label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar size={18} />
                </div>
                <div className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border-b border-gray-200 text-gray-800 font-semibold flex items-center text-sm md:text-base min-h-[44px]">
                  {calculateAge(updateProfile.dateOfBirth)} ปี
                </div>
              </div>
            </div>

            <div>
              <SelectField
                label="อาชีพ"
                value={updateProfile?.job?.id}
                options={jobs}
                onChange={(id) => {
                  const selected = jobs.find((j) => j.id == id);
                  handleChange("job", selected);
                }}
                isEditing={isEditing}
                icon={<Briefcase size={18} />}
                placeholder="เลือกอาชีพ"
              />
              {!isEditing && !profile?.job?.id && (
                <p className="mt-1 ml-1 text-xs text-red-500">กรุณาระบุอาชีพของคุณ</p>
              )}
            </div>

            <div>
              <SelectField
                label="ประเทศ"
                value={updateProfile?.country?.id}
                options={countries}
                onChange={handleCountryChange}
                isEditing={isEditing}
                icon={<Flag size={18} />}
                placeholder="เลือกประเทศ"
              />
              {!isEditing && !profile?.country?.id && (
                <p className="mt-1 ml-1 text-xs text-red-500">กรุณาระบุประเทศของคุณ</p>
              )}
            </div>
            <div>
              <SelectField
                label="จังหวัด / เมือง"
                value={updateProfile?.city?.id}
                options={cities}
                onChange={(id) => {
                  const selected = cities.find((c) => c.id == id);
                  handleChange("city", selected);
                }}
                isEditing={isEditing}
                icon={<MapPin size={18} />}
                placeholder="เลือกจังหวัด / เมือง"
              />
              {!isEditing && !profile?.city?.id && (
                <p className="mt-1 ml-1 text-xs text-red-500">กรุณาระบุจังหวัด / เมืองของคุณ</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                ที่อยู่
              </label>
              {isEditing ? (
                <textarea
                  value={updateProfile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="3"
                  placeholder="ระบุที่อยู่ของคุณ..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700 min-h-[50px] flex items-center border border-transparent text-sm md:text-base break-words shadow-sm">
                  {updateProfile.address || "-"}
                </div>
              )}
            </div>

            <InputField
              label="รหัสไปรษณีย์"
              value={updateProfile.postCode}
              onChange={(v) => handleChange("postCode", v)}
              isEditing={isEditing}
              maxLength={5}
              placeholder="ระบุรหัสไปรษณีย์"
            />
          </div>

          {isEditing && (
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  handleCancel();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-8 py-2.5 rounded-full font-medium bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  isEditing,
  type = "text",
  icon,
  disabled = false,
  placeholder = "",
}) {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        {isEditing ? (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <input
              type={type}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder={placeholder}
              className={`w-full ${
                icon ? "pl-10" : "pl-4"
              } pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base ${
                disabled ? "opacity-60 cursor-not-allowed" : ""
              }`}
            />
          </div>
        ) : (
          <div
            className={`w-full ${
              icon ? "pl-10" : "pl-4"
            } pr-4 py-2.5 bg-white border-b border-gray-100 text-gray-800 font-medium flex items-center text-sm md:text-base min-h-[44px]`}
          >
            {icon && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <span className="truncate w-full block">{value || "-"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  isEditing,
  icon,
  placeholder = "เลือกรายการ",
}) {
  const getDisplayName = (val) => {
    if (!val) return "-";
    if (typeof val === "object") {
      return val.jobNameTh || val.countryNameTh || val.cityNameTh || "-";
    }

    const found = options.find(
      (opt) => opt.id === val || opt.id === Number(val),
    );
    if (found) {
      return found.jobNameTh || found.countryNameTh || found.cityNameTh;
    }
    return val;
  };

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        {isEditing ? (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                {icon}
              </div>
            )}
            <select
              value={typeof value === "object" ? value.id : value || ""}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full ${
                icon ? "pl-10" : "pl-4"
              } pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base appearance-none`}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.jobNameTh || opt.countryNameTh || opt.cityNameTh}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown size={18} />
            </div>
          </div>
        ) : (
          <div
            className={`w-full ${
              icon ? "pl-10" : "pl-4"
            } pr-4 py-2.5 bg-white border-b border-gray-200 text-gray-800 font-medium flex items-center text-sm md:text-base min-h-[44px]`}
          >
            {icon && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <span className="truncate w-full block">
              {getDisplayName(value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}