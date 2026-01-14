import React, { use, useEffect, useState } from "react";
import { Pencil, Check, X , Upload, FileText, Eye, Camera} from "lucide-react"; // ✅ added icons
import ChangePassword from './ChangePassword';
import Navbar from "../components/Navbar";
import ProfileSettingsCard from "../components/ProfileSettingCard.jsx";
import Jobs from "./Jobs";


function UserProfile( onLogout, onShowJobsPage) {
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
          skills: data.skills || "",
          qualification: data.qualification || "",
          bio: data.bio || "",
          education: data.education || "",
          projects: data.projects || "",
          courses: data.courses || "",
          location: data.location || "",
          resume: null,
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
        <ChangePassword 
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
          {/* Cover image (editable) */}
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
                    <Camera
                      className="w-4 h-4 text-gray-700"/>
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

        {/* Name / email area (editable inline) */}
        <div className="mt-20"> {/* add top margin to clear avatar overlap */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {editField === "name" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border p-2 rounded-md w-full"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                  />
                  <Check
                    className="text-green-600 cursor-pointer"
                    onClick={() => handleSingleUpdate("name", fieldValue)}
                  />
                  <X
                    className="text-red-600 cursor-pointer"
                    onClick={() => setEditField(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.name}
                  </h2>
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("name");
                      setFieldValue(profile.name || "");
                    }}
                  />
                </div>
              )}

              {editField === "email" ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="email"
                    className="border p-2 rounded-md w-full"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                  />
                  <Check
                    className="text-green-600 cursor-pointer"
                    onClick={() => handleSingleUpdate("email", fieldValue)}
                  />
                  <X
                    className="text-red-600 cursor-pointer"
                    onClick={() => setEditField(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-600">{profile.email}</p>
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("email");
                      setFieldValue(profile.email || "");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
          <div className="mt-5 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <button className="flex-1 min-w-[140px] py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
              Open to
            </button>
            <button className="flex-1 min-w-[140px] py-2 border-2 border-blue-600 bg-white-300 text-blue-600 font-semibold rounded-full hover:bg-blue-700 hover:text-white transition-colors">
              Enhance profile
            </button>
            <button className="flex-1 min-w-[140px] py-2 border-2 border-blue-600 bg-white-100 text-blue-600 font-semibold rounded-full hover:bg-blue-700 hover:text-white transition-colors">
              Resources
            </button>
          </div>


        {/* Profile Sections — Editable */}
        <div className="mt-6 space-y-6 w-full max-w-5xl">
          <div className="h-25 bg-white rounded-xl shadow p-6 text-left relative">
            <p className="text-black text-sm">
              <h1 className="text-lg font-semibold">Suggested for you</h1>
              <h2 className="font-semibold text-gray-500 ">Private to you</h2>
            </p>
            <hr className="gray-500"></hr>
          </div>
          
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

          {/* Education */}
          <div className="bg-white rounded-xl shadow p-6 text-left relative">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">Education</h3>
              {editField === "qualification" ? (
                <div className="flex gap-2">
                  <Check
                    className="text-green-600 cursor-pointer"
                    onClick={() =>
                      handleSingleUpdate("qualification", fieldValue)
                    }
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
              <input
                type="text"
                className="border p-2 w-full rounded-md"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
              />
            ) : (
              <p className="text-gray-700">
                {profile.qualification || "Not added."}
              </p>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow p-6 text-left relative">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">Projects</h3>
              {editField === "qualification" ? (
                <div className="flex gap-2">
                  <Check
                    className="text-green-600 cursor-pointer"
                    onClick={() =>
                      handleSingleUpdate("projects", fieldValue)
                    }
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
                    setEditField("projects");
                    setFieldValue(profile.projects || "");
                  }}
                />
              )}
            </div>
            {editField === "projects" ? (
              <input
                type="text"
                className="border p-2 w-full rounded-md"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
              />
            ) : (
              <p className="text-gray-700">
                {profile.projects || "Not added."}
              </p>
            )}
          </div>

          {/* Courses */}
          <div className="bg-white rounded-xl shadow p-6 text-left relative">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">Courses</h3>
              {editField === "qualification" ? (
                <div className="flex gap-2">
                  <Check
                    className="text-green-600 cursor-pointer"
                    onClick={() =>
                      handleSingleUpdate("courses", fieldValue)
                    }
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
                    setEditField("courses");
                    setFieldValue(profile.courses || "");
                  }}
                />
              )}
            </div>
            {editField === "courses" ? (
              <input
                type="text"
                className="border p-2 w-full rounded-md"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
              />
            ) : (
              <p className="text-gray-700">
                {profile.courses || "Not added."}
              </p>
            )}
          </div>

          {/* Resume (upload / edit / preview) */}
          <div className="bg-white rounded-xl shadow p-6 text-left relative">
            <div className="flex justify-between mb-2 items-center">
              <h3 className="text-lg font-semibold">Resume</h3>

              {editField === "resume" ? (
                <div className="flex gap-2 items-center">
                  <Check
                    className="text-green-600 cursor-pointer"
                    onClick={async () => {
                      // upload selected file (formData.resume must be a File)
                      const file = formData.resume;
                      if (!file) {
                        alert("No file selected.");
                        return;
                      }
                      await handleSingleUpdate("resume", file);
                    }}
                  />
                  <X
                    className="text-red-600 cursor-pointer"
                    onClick={() => {
                      setEditField(null);
                      setFormData({ ...formData, resume: null });
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {profile.resume ? (
                    <a
                      href={mediaUrl(profile.resume)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-500 hover:underline"
                    >
                      <FileText className="inline w-4 h-4 mr-1" />
                      View current
                    </a>
                  ) : null}
                  <Pencil
                    className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setEditField("resume");
                      // clear any previous selected file name in UI
                      setFormData({ ...formData, resume: null });
                    }}
                  />
                </div>
              )}
            </div>

            {editField === "resume" ? (
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border rounded-md">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Choose file</span>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange(e)}
                  />
                </label>

                {formData.resume ? (
                  <div className="text-sm text-gray-700">
                    <span>{formData.resume.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        // open client-side preview
                        const url = URL.createObjectURL(formData.resume);
                        window.open(url, "_blank");
                      }}
                      className="ml-3 text-sm text-blue-600 underline"
                    >
                      Preview
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No file selected.</p>
                )}
              </div>
            ) : profile.resume ? (
              <p className="text-gray-700 mt-2">
                <a
                  href={mediaUrl(profile.resume)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {profile.resume.split("/").pop()}
                </a>
              </p>
            ) : (
              <p className="text-gray-700 mt-2">No resume uploaded.</p>
            )}
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
}

export default UserProfile;
