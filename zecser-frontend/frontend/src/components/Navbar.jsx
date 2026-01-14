// src/components/Navbar.jsx
import React from "react";
import {User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {AiOutlineSearch} from "react-icons/ai";
import { AiFillHome } from "react-icons/ai";
import { IoMdNotifications,IoMdArrowDropdown  } from "react-icons/io";
import {MdPeopleAlt} from "react-icons/md";
import { CgMenuGridO } from "react-icons/cg";
import { IoBriefcase } from "react-icons/io5";
import Jobs from "../pages/Jobs";

export default function Navbar({ activeTab, setActiveTab, onLogout, onShowJobsPage}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white text-gray-500 px-6 py-3 shadow-md">
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Zecser</h1>
        </div>
        <div className="bg-gray-100 rounded-full flex items-center px-3 py-1">
            <AiOutlineSearch className="text-gray-700 mr-2" />
            <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-sm w-32 sm:w-64 text-gray-700"
            />
        </div>

        <div className="flex gap-8 items-center justify-between">
            <div className="hover:text-black">
                <button
                    onClick={() => setActiveTab("home")}
                    className={`flex items-center gap-1 hover:text-black cursor-pointer ${
                    activeTab === "home" ? "text-black font-semibold" : ""
                }`}
                >
                <AiFillHome className="text-2xl fill-gray-500 hover:text-black cursor-pointer " />
                <span>Home</span>
                </button>
            </div>

            <div className="hover:text-black">
                <button
                    onClick={() => setActiveTab("my-network")}
                    className={`flex items-center gap-1 hover:text-black cursor-pointer ${
                    activeTab === "my-network" ? "text-black font-semibold" : ""
                    }`}
                    >
                <MdPeopleAlt className="text-2xl fill-gray-500 hover:text-black cursor-pointer "/>
                <span>My Network</span>
                </button>
            </div>

            <div className="hover:text-black">
                <Link
        to="/jobs"
        className={`flex items-center gap-1 cursor-pointer ${
          activeTab === "/jobs" ? "text-black font-semibold" : "text-gray-500"
        } hover:text-black`}
      >
        <IoBriefcase className="text-2xl" />
        <span>Jobs</span>
      </Link>
            </div>

            <div className="hover:text-black">
                <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex items-center gap-1 hover:text-black cursor-pointer ${
                    activeTab === "notifications" ? "text-black font-semibold" : ""
                    }`}
                    >
                    < IoMdNotifications className="text-2xl fill-gray-500"/> 
                    <span>Notifications</span>
                </button>
            </div>

            <div className="hover:text-black">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-1 hover:text-black cursor-pointer ${
                    activeTab === "profile" ? "text-black font-semibold" : ""
                    }`}
                >
                <User size={18} /> Profile
                </button>
            </div>
        </div>
        <div className="flex flex-row hover:text-black">
            <CgMenuGridO className="text-2xl fill-gray-500 hover:text-black cursor-pointer"/>
            <span>For Business</span>
            <IoMdArrowDropdown className="text-2xl fill-gray-500 hover:text-black cursor-pointer"/>
        </div>

        <button
            onClick={onLogout}
            className="flex items-center gap-1 hover:text-black"
        >
            <LogOut size={18} /> Logout
        </button>
    </nav>
  );
}
