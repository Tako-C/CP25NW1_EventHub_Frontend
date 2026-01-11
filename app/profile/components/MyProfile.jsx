"use client";

import { User, Mail, Briefcase, MapPin, Phone, Flag, ChevronDown } from "lucide-react";
import { postUpdateProfile, getData } from "@/libs/fetch";
import { useState, useEffect } from "react";

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

  const fetchData = async () => {
    try {
      const resJob = await getData(`users/jobs`);
      const resCountry = await getData(`users/countrys`);

      setJobs(resJob?.data || []);
      setCountries(resCountry?.data || []);

      // ดึงเมืองเริ่มต้น (เช่น จากประเทศที่ user มีอยู่ หรือประเทศแรกใน list)
      const countryId = updateProfile?.country?.id || resCountry?.data?.[0]?.id;
      if (countryId) {
        const resCity = await getData(`users/country/${countryId}/citys`);
        setCities(resCity?.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(profile);
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

  const handleSave = () => {
    console.log("profile", updateProfile);
    editData(updateProfile);
    setIsEditing(false);
    window.location.reload();
  };

  const editData = async (data) => {
    const res = await postUpdateProfile(data);
    console.log(res);
  };

  const handleCountryChange = async (countryId) => {
    const selectedCountry = countries.find((c) => c.id == countryId);
    handleChange("country", selectedCountry);

    const resCity = await getData(`users/country/${countryId}/citys`);
    setCities(resCity?.data || []);

    handleChange("city", null);
  };

  const handleCancel = () => {
    setUpdateProfile(profile); 
    setIsEditing(false);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            My Account
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your personal information
          </p>
        </div>
        {!isEditing && (
          <button
            // disabled
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
          >
            Edit Profile
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
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg md:text-xl text-gray-900 break-words max-w-[200px]">
              {profile.firstName} {profile.lastName}
            </h3>
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wide">
              {profile.role || "User"}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputField
                label="First Name"
                value={updateProfile.firstName}
                onChange={(v) => handleChange("firstName", v)}
                isEditing={isEditing}
                icon={<User size={18} />}
                maxLength={20}
              />
              <InputField
                label="Last Name"
                value={updateProfile.lastName}
                onChange={(v) => handleChange("lastName", v)}
                isEditing={isEditing}
                maxLength={20}
              />
            </div>
            <InputField
              label="Email Address"
              value={updateProfile.email}
              onChange={(v) => handleChange("email", v)}
              isEditing={isEditing}
              type="email"
              icon={<Mail size={18} />}
              disabled={true}
            />
            <InputField
              label="Phone Number"
              value={updateProfile.phone}
              onChange={(v) => handleChange("phone", v)}
              isEditing={isEditing}
              type="tel"
              icon={<Phone size={18} />}
              maxLength={10}
            />

            <SelectField
              label="Job"
              value={updateProfile?.job?.id}
              options={jobs}
              onChange={(id) => {
                const selected = jobs.find((j) => j.id == id);
                handleChange("job", selected);
              }}
              isEditing={isEditing}
              icon={<Briefcase size={18} />}
            />
            <SelectField
              label="Country"
              value={updateProfile?.country?.id}
              options={countries}
              onChange={handleCountryChange}
              isEditing={isEditing}
              icon={<Flag size={18} />}
            />
            <SelectField
              label="City / Province"
              value={updateProfile?.city?.id}
              options={cities}
              onChange={(id) => {
                const selected = cities.find((c) => c.id == id);
                handleChange("city", selected);
              }}
              isEditing={isEditing}
              icon={<MapPin size={18} />}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={updateProfile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700 min-h-[50px] flex items-center border border-transparent text-sm md:text-base break-words">
                  {updateProfile.address || "-"}
                </div>
              )}
            </div>
            <InputField
              label="Post Code"
              value={updateProfile.postCode}
              onChange={(v) => handleChange("postCode", v)}
              isEditing={isEditing}
              maxLength={5}
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
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-8 py-2.5 rounded-full font-medium bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                Save Changes
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
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
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
            } pr-4 py-2.5 bg-white border-b border-gray-200 text-gray-800 font-medium flex items-center text-sm md:text-base min-h-[44px]`}
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
  placeholder = "Select option",
}) {
  const getDisplayName = (val) => {
    if (!val) return "-";
    if (typeof val === "object") {
      return val.jobNameTh || val.countryNameTh || val.cityNameTh || "-";
    }

    const found = options.find(
      (opt) => opt.id === val || opt.id === Number(val)
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
