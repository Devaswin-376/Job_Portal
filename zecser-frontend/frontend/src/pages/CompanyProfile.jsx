import React, { useEffect, useState } from "react";
import { MoveRight,Pencil,Camera,Upload,FileText} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileSettingsCard from "../components/ProfileSettingCard";
import ChangePassword from "./ChangePassword";
import { Check, X } from "lucide-react";


function CompanyProfile({onLogout, onShowJobsPage}) {

  const [activeTab, setActiveTab] = useState("Home");
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null); // ✅ track which section is being edited
  const [fieldValue, setFieldValue] = useState(""); // ✅ store temporary edit value
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const[identity,setIdentity]=useState({name: "", email: "" });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [preview, setPreview] = useState({});

  const _raw =
    localStorage.getItem("access") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token");
  let token = null;

  try {
    if (_raw && _raw.trim().startsWith("{")) {
      const parsed = JSON.parse(_raw);
      token = parsed?.accessToken || parsed?.access || null;
    } else if (_raw && _raw.includes("[object Object]")) {
      token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        null;
    } else {
      token = _raw;
    }
  } catch {
    token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      _raw ||
      null;
  }

  useEffect(() => {
    if (!token) {
      alert("No access token found. Please log in again.");
      window.location.href = "/login";
      return;
    }

    const rawToken = token.replace(/^Bearer\s+/i, "").trim();
    const authHeader = `Bearer ${rawToken}`;

    fetch("http://127.0.0.1:8000/api/auth/profile/", {
      headers: { Authorization: authHeader },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setIdentity({ name: data.name || "", email: data.email || "" }); // init identity
        setFormData({
          bio: data.bio || "",
          services: data.services || "",
          website: data.website || "",
          location: data.location || "",
          logo: null,
          cover_picture: null,
          peoples : data.peoples || "",
        });
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [token]);

  const handleFileChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const mediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8000${p}`;
  };

  

  // ✅ reusable single-field update
  const handleSingleUpdate = async (field, value) => {
    const form = new FormData();
    form.append(field, value);

    const rawToken = token.replace(/^Bearer\s+/i, "").trim();
    const authHeader = `Bearer ${rawToken}`;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: "PUT",
        headers: { Authorization: authHeader },
        body: form,
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditField(null);
        setFormData(prev => ({
          ...prev,
          [field]: null
        }));
        alert("Updated successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Update failed");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error occurred");
    }
  };

  const handleUpdate = async () => {
    if (!token) {
      alert("Access token missing. Please log in again.");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) form.append(key, formData[key]);
    });

    const rawToken = token.replace(/^Bearer\s+/i, "").trim();
    const authHeader = `Bearer ${rawToken}`;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: "PUT",
        headers: { Authorization: authHeader },
        body: form,
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Update failed");
        alert(errorData.detail || "Failed to update profile");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error occurred");
    }
  };

  // ...existing code...
  const handleIdentitySave = async () => {
    const validToken = token?.replace(/^Bearer\s+/i, "").trim();
    if (!validToken) {
      alert("No access token. Please log in.");
      return;
    }
    const form = new FormData();
    form.append("name", identity.name);
    form.append("email", identity.email);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${validToken}`, Accept: "application/json" },
        body: form,
      });
      // ...existing code...
    } catch (err) {
      console.error("Network error:", err);
    }
  };
// ...existing code...

  // Add token resolution helper
  const resolveToken = () => {
    const _raw = localStorage.getItem("access") || 
                 localStorage.getItem("accessToken");
    if (!_raw) return null;
    
    try {
      if (_raw.trim().startsWith("{")) {
        const parsed = JSON.parse(_raw);
        return parsed?.accessToken || parsed?.access || null;
      }
      return _raw.replace(/^Bearer\s+/i, "").trim();
    } catch {
      return _raw;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    onLogout()
  };

  const handleBacktoProfile = () => {
    setShowChangePassword(false);
  }

  if (!profile)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  if (showChangePassword) {
    return (
        <ChangePassword 
        onBack={handleBacktoProfile}
        token={resolveToken()} />
    );
  }

  const tabs = ["home", "services", "posts", "jobs", "peoples"];

  return (
    <div className="flex min-h-screen bg-gray-100 rounded-xl">
      {/* ✅ Navbar at top */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onShowJobsPage={onShowJobsPage}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto w-[600px] mx-auto mt-10">
        <div className="relative w-full max-w-5xl">
          {/* Cover image (editable) */}
          <div className="relative">
            <img src={
              formData.cover_picture
                ? URL.createObjectURL(formData.cover_picture)
                : profile?.cover_picture
                ? mediaUrl(profile.cover_picture)
                : "https://via.placeholder.com/1200x300?text=Cover+Photo"
            } alt="cover" 
              className="w-full h-48 object-cover rounded-t-xl"
            />

            <div className="absolute top-4 right-3 flex items-center gap-2">
              {editField === "cover_picture" ? (
                <div className="flex items-center gap-2">
                  <Check
                    className="bg-white rounded-full p-1 text-green-600 cursor-pointer"
                    onClick={async () => {
                      const file = formData.cover_picture;
                      if (!file) {
                        alert("No file selected.");
                        return;
                      }
                      await handleSingleUpdate("cover_picture", file);
                    }}
                  />
                  <X
                    className="bg-white rounded-full p-1 text-red-600 cursor-pointer"
                    onClick={() => {
                      setEditField(null);
                      setFormData(prev => ({ ...prev, cover_picture: null }));
                      setPreview(prev => ({ ...prev, cover_picture: null }));
                    }}
                  />
                </div>
              ) : (
                <label className="cursor-pointer rounded-full shadow hover:bg-gray-50 p-1">
                  <Camera
                    className="w-4 h-4 text-gray-700"/>
                    <input
                      type="file"
                      name="cover_picture"
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        handleFileChange(e);
                        const file = e.target.files?.[0];
                        if (file){
                          setPreview(prev => ({
                            ...prev,
                            cover_picture: URL.createObjectURL(file)
                          }));
                          setEditField("cover_picture");
                        }
                      }}
                    />
                  </label>
              )}
            </div>
          </div>

          {/* Profile avatar (editable) */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                src={
                  formData.logo
                    ? URL.createObjectURL(formData.logo)
                    : profile?.logo
                    ? mediaUrl(profile.logo)
                    : "https://via.placeholder.com/130?text=Logo"
                }
                alt="company logo"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover "
              />

              {/* Logo edit controls */}
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                {editField === "logo" ? (
                  <div className="flex items-center gap-1">
                    <Check
                      className="bg-white rounded-full p-1 text-green-600 cursor-pointer"
                      onClick={async () => {
                        const file = formData.logo;
                        if (!file) {
                          alert("No file selected.");
                          return;
                        }
                        await handleSingleUpdate("logo", file);
                      }}
                    />
                    <X
                      className="bg-white rounded-full p-1 text-red-600 cursor-pointer"
                      onClick={() => {
                        setEditField(null);
                        setFormData(prev => ({ ...prev, logo:null }));
                        setPreview(prev => ({ ...prev, logo: null}));
                      }}
                    />
                  </div>
                ) : (
                  <label className="cursor-pointer rounded-full shadow hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-700"/>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { 
                        handleFileChange(e);
                        const file = e.target.files?.[0];
                        if(file) {
                          setPreview(prev => ({ ...prev, logo: URL.createObjectURL(file)}));
                          setEditField("logo");
                        }}
                      }
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name || "Company Name"}
              </h2>
              <p className="text-blue-800 font-bold flex items-center gap-2 mt-1">
                {profile.email || "No email provided"}
              </p>
            </div>
          
          

      
            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                className="flex-1 min-w-[140px] py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
              >
                Open to
              </button>
              <button className="flex-1 min-w-[140px] py-2 border-2 border-blue-600 bg-white-300 text-blue-600 font-semibold rounded-full hover:bg-blue-700 hover:text-white transition-colors">
                Add Profile Section
              </button>
              <button className="flex-1 min-w-[140px] py-2 border-2 border-blue-600 bg-white-100 text-blue-600 font-semibold rounded-full hover:bg-blue-700 hover:text-white transition-colors">
                Enhance profile
              </button>
            </div>
            

            <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-md shadow-sm"></div>
            <div className="sm:flex flex-row border-b border-gray-200 mt-5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-4 py-2 text-sm font-medium relative transition-colors ${
                  activeTab === tab
                    ? "text-green-700"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                {tab}
                {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"></span>
                )}
                </button>
              ))}
            </div>
            

            
            {/* Overview */}
            {activeTab === "home" && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 text-left relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Overview
                </h3>
                {editField === "bio" ? (
                  <div className="flex gap-2">
                    <Check
                      className="text-green-600 cursor-pointer"
                      onClick={() => handleSingleUpdate("bio", fieldValue)}
                    />
                    <X
                      className="text-red-600 cursor-pointer"
                      onClick={() => setEditField(null)}
                    />
                  </div>
                  ) : (
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("bio");
                      setFieldValue(profile.bio || "");
                    }}
                  />
                )}
            
                {editField === "bio" ? (
                  <textarea
                    className="border p-2 w-full rounded-md"
                    value={fieldValue}
                    onChange={ (e) => setFieldValue(e.target.value)}
                  />
                  ) : (
                  <p className="text-gray-700 leading-relaxed mt-2">
                    {profile.bio || "No overview provided."}
                  </p>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Location
                </h3>
                {editField === "location" ? (
                  <div className="flex gap-2">
                    <Check
                      className="text-green-600 cursor-pointer"
                      onClick={() => handleSingleUpdate("location", fieldValue)}
                    />
                    <X
                      className="text-red-600 cursor-pointer"
                      onClick={() => setEditField(null)}
                    />
                  </div>
                  ) : (
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("location");
                      setFieldValue(profile.location || "");
                    }}
                  />
                )}
            
                {editField === "location" ? (
                  <textarea
                    className="border p-2 w-full rounded-md"
                    value={fieldValue}
                    onChange={ (e) => setFieldValue(e.target.value)}
                  />
                  ) : (
                  <p className="text-gray-700 leading-relaxed mt-2">
                    {profile.location || "No location details provided."}
                  </p>
                )}
              </div>
            )}

            {/* Services */}
            {activeTab === "services" && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 text-left relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Services
                </h3>
                {editField === "services" ? (
                  <div className="flex gap-2">
                    <Check
                      className="text-green-600 cursor-pointer"
                      onClick={() => handleSingleUpdate("services", fieldValue)}
                    />
                    <X
                      className="text-red-600 cursor-pointer"
                      onClick={() => setEditField(null)}
                    />
                  </div>
                  ) : (
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("services");
                      setFieldValue(profile.services || "");
                    }}
                  />
                )}
            
                {editField === "services" ? (
                  <textarea
                    className="border p-2 w-full rounded-md"
                    value={fieldValue}
                    onChange={ (e) => setFieldValue(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed mt-2">
                    {profile.services || "No services provided."}
                  </p>
                )}
              </div>
            )}

            {/* Posts */}
            {activeTab === "posts" && (
              <div className="mt-8 bg-white rounded-2xl shadow border border-gray-200 text-left relative">
                <h3 className="text-lg font-semibold text-gray-900 px-6 pt-4">
                  Page posts
                </h3>
                <div className="flex overflow-x-auto gap-4 px-6 py-4 scrollbar-hide">
                  <p>nothing to show...</p>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-blue-600 font-medium hover:bg-gray-200 border-t border-gray-200">
                  Create a post →
                </button>
              </div>
            )}

            {/* Jobs*/}
            {activeTab === "jobs" && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 text-left relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Jobs
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  No jobs posted.
                </p>
                {/* Button */}
                <button className="text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-full px-4 py-1 text-sm transition cursor-pointer mt-4">
                  Post a free job
                </button>
              </div>
            )}

            {/* Employees */}
            {activeTab === "peoples" && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 text-left relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Peoples
                </h3>
                {editField === "peoples" ? (
                  <div className="flex gap-2">
                    <Check
                      className="text-green-600 cursor-pointer"
                      onClick={() => handleSingleUpdate("peoples", fieldValue)}
                    />
                    <X
                      className="text-red-600 cursor-pointer"
                      onClick={() => setEditField(null)}
                    />
                  </div>
                  ) : (
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("peoples");
                      setFieldValue(profile.peoples || "");
                    }}
                  />
                )}
            
                {editField === "peoples" ? (
                  <textarea
                    className="border p-2 w-full rounded-md"
                    value={fieldValue}
                    onChange={ (e) => setFieldValue(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed mt-2">
                    {profile.peoples || "No employee details."}
                  </p>
                )}
              </div>
            )}
          </div>
      </main>

      {/* Sidebar on the left */}
      <aside className="w-64 h-55  bg-white rounded-xl shadow-md mt-10 p-6 hidden md:flex-col md:gap-6 md:block">
        <nav className="space-y-3">
          <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-800">
            <h3 className="font-semibold text-gray-800">My Jobs</h3>
          </button>
          <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-800">
            <h3 className="font-semibold text-gray-800">Settings</h3>
          </button>
          <button
              onClick={() => setShowChangePassword(true)}
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-800"
          >
            <h3 className="font-semibold text-gray-800">Change Password</h3>
          </button>
        </nav>
        <div className="mt-15">
          <ProfileSettingsCard/>
        </div>
      </aside>
    </div>
  );
};

export default CompanyProfile;