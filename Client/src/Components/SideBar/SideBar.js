import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

import CompanyLogo from "../../Assets/jklogo.png";
import Home from "../../Assets/home-solid.svg";
import Team from "../../Assets/social.svg";
import Calender from "../../Assets/sceduled.svg";
import Projects from "../../Assets/starred.svg";
import Documents from "../../Assets/draft.svg";
import PowerOff from "../../Assets/power-off-solid.svg";
import BackupIcon from "../../Assets/backup.svg";

const Sidebar = () => {
  const [click, setClick] = useState(true); // Sidebar starts open
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setClick((prevState) => !prevState);
  };

  const handleLogOut = () => {
    navigate("/");
  };

  const handleMenuClick = () => {
    if (!click) {
      setClick(true);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/backup`);
      if (response.data.success) {
        toast.success("Database backup completed successfully!");
      } else {
        throw new Error(response.data.message || "Backup failed");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
      {/* Sidebar Toggle Button */}
      <div style={{ display: "flex", alignItems: "center", zIndex: 1100 }}>
        <button
          style={{
            backgroundColor: click ? "var(--highlight)" : "var(--black)",
            border: "none",
            width: "2rem", // Reduced toggle button size
            height: "2rem",
            borderRadius: "50%",
            margin: "0.5rem",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.2rem", // Slightly smaller font size
            color: "var(--white)", // High contrast color
            zIndex: 1100,
          }}
          onClick={toggleSidebar}
        >
          {click ? (
            <span style={{ fontWeight: "bold" }}>×</span> // Cross icon
          ) : (
            <span style={{ fontWeight: "bold" }}>☰</span> // Hamburger menu
          )}
        </button>
      </div>

      <div
        style={{
          backgroundColor: "var(--black)",
          width: click ? "8rem" : "2.5rem", // Reduced sidebar width when open
          height: "100vh",
          padding: "0.5rem 0", // Reduced padding
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          overflowY: "auto",
          position: "fixed",
          top: 0,
          left: 0,
          transition: "width 0.3s ease",
        }}
      >
        {/* Logo */}
        <div style={{ width: click ? "4rem" : "2rem", marginTop: "0.5rem" }}>
          <img
            src={CompanyLogo}
            alt="logo"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "50%",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Navigation Links */}
        <ul
          style={{
            color: "var(--white)",
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            padding: "1rem 0", // Adjusted padding for compactness
            overflowY: "auto",
            maxHeight: "calc(100vh - 10rem)", // Adjust based on header/footer sizes
          }}
        >
          {[
            { icon: Home, text: "List Of Organizations", link: "/home" },
            { icon: Team, text: "User Creation", link: "/usercreationutility" },
            { icon: Calender, text: "Category Creation", link: "/calender" },
            { icon: Documents, text: "Client Connect", link: "/documents" },
            { icon: Projects, text: "List Of Category", link: "/projects" },
          ].map((item, index) => (
            <NavLink
              key={index}
              to={item.link}
              style={{
                textDecoration: "none",
                color: "var(--white)",
                width: "100%",
                padding: "0.8rem 0", // Reduced padding
                display: "flex",
                alignItems: "center",
                paddingLeft: "0.2rem", // Adjusted padding
                transition: "all 0.3s ease",
              }}
              activeStyle={{
                borderRight: "3px solid var(--white)", // Adjusted border size
              }}
              onClick={handleMenuClick}
            >
              <img
                src={item.icon}
                alt={item.text}
                style={{
                  width: "1rem", // Smaller icon size
                  height: "auto",
                  filter:
                    "invert(92%) sepia(4%) saturate(1033%) hue-rotate(169deg) brightness(78%) contrast(85%)",
                }}
              />
              <span
                style={{
                  marginLeft: click ? "0.5rem" : "0",
                  opacity: click ? 1 : 0,
                  fontSize: "0.8rem", // Smaller font size
                  transition: "opacity 0.3s ease, margin-left 0.3s ease",
                }}
              >
                {item.text}
              </span>
            </NavLink>
          ))}

<li
            style={{
              width: "100%",
              padding: "0.8rem 0",
              display: "flex",
              alignItems: "center",
              paddingLeft: "0.2rem",
              cursor: "pointer",
            }}
            onClick={handleDatabaseBackup}
          >
            <img
              src={BackupIcon}
              alt="Database Backup"
              style={{
                width: "1rem",
                height: "auto",
                filter:
                  "invert(92%) sepia(4%) saturate(1033%) hue-rotate(169deg) brightness(78%) contrast(85%)",
              }}
            />
            <span
              style={{
                marginLeft: click ? "0.5rem" : "0",
                opacity: click ? 1 : 0,
                fontSize: "0.8rem",
                transition: "opacity 0.3s ease, margin-left 0.3s ease",
              }}
            >
              Database Backup
            </span>
          </li>



          
        </ul>

         {/* Database Backup */}
        
        

        {/* Logout Section */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: click ? "space-between" : "center",
            alignItems: "center",
            padding: "0.5rem",
            borderTop: "1px solid var(--grey)",
          }}
        >
          <img
            src={CompanyLogo}
            alt="Profile"
            style={{
              width: "2rem", // Smaller profile image
              height: "2rem",
              borderRadius: "50%",
              cursor: "pointer",
            }}
            onClick={toggleSidebar}
          />
          {click && (
            <button
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleLogOut}
            >
              <img
                src={PowerOff}
                alt="logout"
                style={{
                  width: "1rem", // Smaller logout icon
                  filter:
                    "invert(15%) sepia(70%) saturate(6573%) hue-rotate(2deg) brightness(100%) contrast(126%)",
                }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;