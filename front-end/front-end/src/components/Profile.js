import React, { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) form.append(key, val);
    });

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();

      if (res.ok) {
        setProfile(data);
        setEditMode(false);
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Update failed.");
      }
    } catch {
      setMessage("Error updating profile.");
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-left">
          <img
            src={profile.profile_picture || "https://via.placeholder.com/150"}
            alt="Profile"
            className="profile-pic"
          />
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          {!editMode && (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-right">
          {editMode ? (
            <form onSubmit={handleSave} className="edit-form">
              <label>Skills</label>
              <input
                type="text"
                name="skills"
                defaultValue={profile.skills}
                onChange={handleChange}
              />

              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                defaultValue={profile.qualification}
                onChange={handleChange}
              />

              <label>Resume</label>
              <input type="file" name="resume" onChange={handleChange} />

              <label>Profile Picture</label>
              <input type="file" name="profile_picture" onChange={handleChange} />

              <button type="submit" className="save-btn">Save</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="profile-details">
              <p><strong>Skills:</strong> {profile.skills || "N/A"}</p>
              <p><strong>Qualification:</strong> {profile.qualification || "N/A"}</p>
              {profile.resume && (
                <p>
                  <strong>Resume:</strong>{" "}
                  <a href={profile.resume} target="_blank" rel="noreferrer">
                    View Resume
                  </a>
                </p>
              )}
            </div>
          )}
          {message && <p className="status-msg">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Profile;
