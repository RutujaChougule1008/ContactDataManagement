import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import logo from "../../../Assets/jklogo.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const apikey = process.env.REACT_PYTHON_API_URL

const LoginPage = () => {
  const usernameRef = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    showPassword: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTogglePassword = () => {
    setFormData((prevState) => ({
      ...prevState,
      showPassword: !prevState.showPassword,
    }));
  };

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    try {
      // Make the API request with axios
      const response = await axios.post(`http://localhost:8080/api/eBuySugar/userlogin`, {
        User_Name: username,
        User_Password: password,
      });

      const data = response.data;


      if (response.status === 200) {
        toast.success("Successfully Logged In....")
        sessionStorage.setItem('access_token', data.access_token);
        navigate("/home");
      } else {

        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Invalid Credentials...")
    }
  };

  return (
    <div className="login-container">
      <ToastContainer/>
      <div className="login-content">
        <img
          src={logo}
          alt="JK Sugars & Commodities Logo"
          className="logo"
        />
        <h3>JK Sugars & Commodities</h3>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            ref={usernameRef}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              type={formData.showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
            <i
              className="password-toggle-icon"
              onClick={handleTogglePassword}
            >
              {formData.showPassword ? (
                <AiOutlineEye size={24} />
              ) : (
                <AiOutlineEyeInvisible size={24} />
              )}
            </i>
          </div>

          <button type="submit" className="submit-button">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
