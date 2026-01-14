import React, { useEffect, useState } from "react";
import defaultLogo from "../assets/default.jpeg";
import Navbar from "../components/Navbar";


function Jobs({ onClose }) {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/jobs/jobs") // adjust endpoint
      .then(res => res.json())
      .then(setJobs)
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
    onLogout()
  };

  return (
    <div className="flex min-h-screen bg-gray-100 rounded-xl">
      {/* ✅ Navbar at top */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main class*/}
      <main className="flex-1 p-6 overflow-y-auto w-[600px] mx-auto mt-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">All Jobs</h1>
          {onClose && (
            <button onClick={onClose} className="text-sm text-blue-600 bg-grey">
              Back
            </button>
          )}
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs found.</p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded shadow">
                <img
                  src={job.logo}
                  alt="company_logo"
                  defaultValue={defaultLogo}
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <h2 className="font-semibold">{job.title}</h2>
                <p className="text-sm text-gray-600">{job.company_name}</p>
                <p className="text-sm text-gray-700 mt-2">{job.description}</p>
                <button className="bg-blue-500 text-white rounded-b-lg w-full h-fit mt-5 ">
                  See Details 
                </button>
              </div>
              
            ))
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

export default Jobs;