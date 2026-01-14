import React, { useEffect, useState } from "react";
import { MoveRight,Pencil,Camera,Briefcase,Check,X} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileSettingsCard from "../components/ProfileSettingCard";
import CompanyCover from "../assets/cover.jpg"
import CompanyLogo from "../assets/Logo.png"


function EmployerProfile( onLogout, onShowJobsPage) {
  const [activeTab, setActiveTab] = useState();
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
          company_name: data.company_name || "",
          qualification: data.qualification || "",
          bio: data.bio || "",
          designation: data.designation || "",
          department: data.department || "",
          location: data.location || "",
          profile_picture: null,
          cover_picture: null,
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
        alert(errorData.detail || "Failed to update Profile");
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
        <showChangePassword
          onBack={handleBacktoProfile}
          token={resolveToken()} />
    );
  }

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
          {/* Banner */}
          <div className="relative">
            <img
              src={
                formData.cover_picture
                ? URL.createObjectURL(formData.cover_picture)
                : profile?.cover_picture
                ? mediaUrl(profile.cover_picture)
                : "https://via.placeholder.com/1200x300?text=Cover+Photo"
              }
              alt="cover"
              className="w-full h-60 object-cover rounded-b-lg shadow"
            />
          
            {/* cover edit icon */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
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
                    <Camera className="w-4 h-4 text-gray-700"/>
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
                  formData.profile_picture
                  ? URL.createObjectURL(formData.profile_picture)
                  : profile.profile_picture
                  ? mediaUrl(profile.profile_picture)
                  : "https://via.placeholder.com/130?text=Profile"
                  }
                  alt="profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover "
              />
          
              {/* small edit control over avatar */}
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                {editField === "profile_picture" ? (
                  <div className="flex items-center gap-1">
                    <Check
                      className="bg-white rounded-full p-1 text-green-600 cursor-pointer"
                      onClick={async () => {
                        const file = formData.profile_picture;
                        if (!file) {
                          alert("No file selected.");
                          return;
                        }
                        await handleSingleUpdate("profile_picture", file);
                      }}
                    />
                    <X
                      className="bg-white rounded-full p-1 text-red-600 cursor-pointer"
                      onClick={() => {
                        setEditField(null);
                        setFormData(prev => ({ ...prev, profile_picture: null }));
                        setPreview(prev => ({ ...prev, profile_picture: null }));
                      }}
                    />
                  </div>
                ) : (
                  <label className="cursor-pointer rounded-full shadow hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-700"/>
                    <input
                      type="file"
                      name="profile_picture"
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        handleFileChange(e);
                        const file = e.target.files?.[0];
                        if (file){
                          setPreview(prev => ({
                            ...prev,
                            profile_picture: URL.createObjectURL(file)
                          }));
                          setEditField("profile_picture");
                        }
                      }}
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
                {profile.name || "No name provided"}
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

          <div className="mt-6 space-y-6 w-full max-w-5xl">
            {/* About */}
            <div className="bg-white rounded-xl shadow p-6 text-left relative">
              <div className="flex justify-between mb-2 items-center gap-2">
                <h3 className="text-lg font-semibold">About</h3>
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
              </div>
              {editField === "bio" ? (
                <textarea
                  className="border p-2 w-full rounded-md"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile.bio || "No bio yet."}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6 text-left relative">
              <div className="flex justify-between mb-2 items-center gap-2">
                <h3 className="text-lg font-semibold">Location</h3>
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
              </div>
              {editField === "location" ? (
                <textarea
                  className="border p-2 w-full rounded-md"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile.location || "No location provided."}</p>
              )}
            </div>

            {/* Company name */}
            <div className="bg-white rounded-xl shadow p-6 text-left relative">
              <div className="flex justify-between mb-2 items-center gap-2">
                <h3 className="text-lg font-semibold">Company Name</h3>
                  {editField === "company_name" ? (
                    <div className="flex gap-2">
                      <Check
                        className="text-green-600 cursor-pointer"
                        onClick={() => handleSingleUpdate("company_name", fieldValue)}
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
                        setEditField("company_name");
                        setFieldValue(profile.company_name || "");
                      }}
                    />
                  )}
              </div>
              {editField === "company_name" ? (
                <textarea
                  className="border p-2 w-full rounded-md"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile.company_name || "Company name is not provided."}</p>
              )}
            </div>

            {/* Posts */}
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

            {/* Designation or Position*/}
            <div className="bg-white rounded-xl shadow p-6 text-left relative">
              <div className="flex justify-between mb-2 items-center gap-2">
                <h3 className="text-lg font-semibold">Designation</h3>
                  {editField === "designation" ? (
                    <div className="flex gap-2">
                      <Check
                        className="text-green-600 cursor-pointer"
                        onClick={() => handleSingleUpdate("designation", fieldValue)}
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
                        setEditField("designation");
                        setFieldValue(profile.designation || "");
                      }}
                    />
                  )}
              </div>
              {editField === "designation" ? (
                <textarea
                  className="border p-2 w-full rounded-md"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile.designation || "Designation is not provided."}</p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-left relative">
              <div className="flex justify-between mb-2 items-center gap-2">
                <h3 className="text-lg font-semibold">Department</h3>
                  {editField === "department" ? (
                    <div className="flex gap-2">
                      <Check
                        className="text-green-600 cursor-pointer"
                        onClick={() => handleSingleUpdate("department", fieldValue)}
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
                        setEditField("department");
                        setFieldValue(profile.department || "");
                      }}
                    />
                  )}
              </div>
              {editField === "department" ? (
                <textarea
                  className="border p-2 w-full rounded-md"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile.department || "No department provided."}</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow p-6 text-left relative">
              <div className="flex justify-between mb-2 items-center gap-2">
                <h3 className="text-lg font-semibold">Education</h3>
                  {editField === "qualification" ? (
                    <div className="flex gap-2">
                      <Check
                        className="text-green-600 cursor-pointer"
                        onClick={() => handleSingleUpdate("qualification", fieldValue)}
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
                        setEditField("qualification");
                        setFieldValue(profile.qualification || "");
                      }}
                    />
                  )}
              </div>
              {editField === "qualification" ? (
                <textarea
                  className="border p-2 w-full rounded-md"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile.qualification || "No education details."}</p>
              )}
            </div>

          </div>
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

export default EmployerProfile;