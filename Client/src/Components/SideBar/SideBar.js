import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

import CompanyLogo from "../../Assets/jklogo.png";
import Home from "../../Assets/home-solid.svg";
import Team from "../../Assets/social.svg";
import Calender from "../../Assets/sceduled.svg";
import Projects from "../../Assets/starred.svg";
import Documents from "../../Assets/draft.svg";
import PowerOff from "../../Assets/power-off-solid.svg";

const Sidebar = () => {
  const [click, setClick] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setClick(!click);

  const handleLogOut = () => {
    navigate("/");
  };

  return (
    <div style={{
      position: 'fixed',
      marginLeft: '5px',
    }}>
      <button
        style={{
          backgroundColor: click ? 'var(--highlight)' : 'var(--black)',
          border: 'none',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          margin: '0.5rem 0 0 0.5rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
        onClick={handleClick}
      >
        {click ? 'Close' : 'Menu'}
      </button>
      <div style={{
        backgroundColor: 'var(--black)',
        width: click ? '12rem' : '3.5rem',
        height: '80vh',
        marginTop: '1rem',
        borderRadius: '0 30px 30px 0',
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'width 0.5s ease'
      }}>
        <div style={{ width: '3rem' }}>
          <img src={CompanyLogo} alt="logo" style={{ width: '100%', height: 'auto', borderRadius: '50px' }} />
        </div>
        <ul style={{
          color: 'var(--white)',
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'var(--black)',
          padding: '2rem 0',
          position: 'absolute',
          top: '6rem',
          left: 0,
          width: click ? '12rem' : '3.5rem',
          transition: 'all 0.5s ease',
          borderRadius: '0 30px 30px 0'
        }}>
          {[{ icon: Home, text: "Home", link: "/home" }, { icon: Team, text: "Team", link: "/usercreationutility" }, { icon: Calender, text: "Calender", link: "/calender" }, { icon: Documents, text: "Documents", link: "/documents" }, { icon: Projects, text: "Projects", link: "/projects" }].map((item, index) => (
            <NavLink
              key={index}
              to={item.link}
              style={{
                textDecoration: 'none',
                color: 'var(--white)',
                width: '100%',
                padding: '1rem 0',
                cursor: 'pointer',
                display: 'flex',
                paddingLeft: '1rem'
              }}
              activeStyle={{
                borderRight: '4px solid var(--white)'
              }}
              onClick={() => setClick(false)}
            >
              <img src={item.icon} alt={item.text} style={{
                width: '1.2rem',
                height: 'auto',
                filter: 'invert(92%) sepia(4%) saturate(1033%) hue-rotate(169deg) brightness(78%) contrast(85%)'
              }} />
              <span style={{
                width: click ? '100%' : '0',
                overflow: 'hidden',
                marginLeft: click ? '1.5rem' : '0',
                transition: 'all 0.3s ease'
              }}>
                {item.text}
              </span>
            </NavLink>
          ))}
        </ul>
        <div style={{
          width: click ? '14rem' : '3rem',
          height: '3rem',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: click ? '9rem' : '0',
          backgroundColor: 'var(--black)',
          color: 'var(--white)',
          transition: 'all 0.3s ease'
        }}>
          <img
            src={CompanyLogo}
            alt="Profile"
            onClick={() => setClick(!click)}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              ':hover': {
                border: '2px solid var(--grey)',
                padding: '2px'
              }
            }}
          />
          {click && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                padding: '0 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <h4 style={{ display: 'inline-block' }}></h4>
                <a href="/" style={{
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  color: 'var(--grey)',
                  ':hover': {
                    textDecoration: 'underline'
                  }
                }}>
                  
                </a>
              </div>
              <button
                style={{
                  border: 'none',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: 'transparent'
                }}
                onClick={handleLogOut}
              >
                <img
                  src={PowerOff}
                  alt="logout"
                  style={{
                    width: '100%',
                    height: 'auto',
                    filter: 'invert(15%) sepia(70%) saturate(6573%) hue-rotate(2deg) brightness(100%) contrast(126%)',
                    transition: 'all 0.3s ease',
                    ':hover': {
                      border: 'none',
                      padding: 0,
                      opacity: 0.5
                    }
                  }}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
