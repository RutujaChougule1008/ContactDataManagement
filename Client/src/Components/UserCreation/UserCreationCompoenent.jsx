import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import ActionButtonGroup from "../../common/ActionButtonGroup";
import NavigationButtons from "../../common/NavigationButtons";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import './UserCreation.css'

const UserCreationComponent = () => {
  const apiURL = process.env.REACT_APP_API_URL;
  const UserFullnameRef = useRef(null);
  const navigate = useNavigate();

  const [employeeDetails, setEmployeeDetails] = useState({
    User_Code: "",
    User_Name: "",
    Mobile_No: "",
    Email: "",
    Password: "",
    User_Type:"V",
  });

  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(true);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(false);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  

  // Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "Mobile_No" && !/^\d*$/.test(value)) {
      return; 
    }

    setEmployeeDetails({
      ...employeeDetails,
      [name]: value,
    });
  };

 
  const handleAddOne = () => {
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);

    
    axios
      .get(`${apiURL}/get-lastUserCode`)
      .then((response) => {
        const lastEmployeeCode = response.data.lastUserCreation;
        const nextEmployeeCode = lastEmployeeCode + 1;
        setEmployeeDetails({
          User_Code: nextEmployeeCode, 
          User_Name: "",
          Mobile_No: "",
          Email: "",
          Password: "",
          User_Type:"V",
        });
      })
      .catch((error) => {
        console.error("Error fetching last employee code:", error);
      });
  };

  
  const handleEdit = () => {
    setIsEditing(true);
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
  };

 
  const handleSaveOrUpdate = () => {
    const apiPath = isEditMode ? "user_update" : "user_creations";
    const apiMethod = isEditMode ? "put" : "post";
    const endpoint = `${apiURL}/${apiPath}${isEditMode ? `?user_code=${employeeDetails.User_Code}` : ""}`;

    axios[apiMethod](endpoint, employeeDetails)
      .then(() => {
        const message = isEditMode ? "Data updated successfully!" : "Data saved successfully!";
        window.alert(message);
        handleEdit();
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error(`Error ${isEditMode ? "updating" : "saving"} data:`, error);
      });
  };

 
  const handleDelete = () => {
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    axios
      .delete(`${apiURL}/user_delete?user_code=${employeeDetails.User_Code}`)
      .then((response) => {
        window.alert("User deleted successfully");
        handleCancel();
      })
      .catch((error) => {
        console.error("Error during API call:", error);
      });
  };

 
  const handleCancel = () => {
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setIsEditing(false);

    axios
      .get(`${apiURL}/getlastUserData`)
      .then((response) => {
        const lastRecord = response.data.lastUserCreation;
        setEmployeeDetails({
          User_Code: lastRecord.user_code,
          User_Name: lastRecord.user_name,
          Mobile_No: lastRecord.mobile_no,
          Email: lastRecord.email,
          Password: lastRecord.password,
          User_Type: lastRecord.user_type,
        });
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };

  
  const fetchFirstRecord = () => {
    axios.get(`${apiURL}/get-first-navigation`).then((response) => {
      const firstRecord = response.data.firstUserCreation;
      setEmployeeDetails({
        User_Code: firstRecord.user_code,
        User_Name: firstRecord.user_name,
        Mobile_No: firstRecord.mobile_no,
        Email: firstRecord.email,
        Password: firstRecord.password,
        User_Type: firstRecord.user_type ||"V",
      });
      setEditButtonEnabled(true);  
      setDeleteButtonEnabled(true);
    });
  };

  const fetchLastRecord = () => {
    axios.get(`${apiURL}/get-last-navigation`).then((response) => {
      const lastRecord = response.data.lastUserCreation;
      setEmployeeDetails({
        User_Code: lastRecord.user_code,
        User_Name: lastRecord.user_name,
        Mobile_No: lastRecord.mobile_no,
        Email: lastRecord.email,
        Password: lastRecord.password,
        User_Type: lastRecord.user_type ||"V",
      });
      setEditButtonEnabled(true);  
      setDeleteButtonEnabled(true);
    });
  };

  const fetchPreviousRecord = () => {
    axios
      .get(`${apiURL}/get_previous_navigation?current_user_code=${employeeDetails.User_Code}`)
      .then((response) => {
        const previousRecord = response.data.previousUserCreation;
        setEmployeeDetails({
          User_Code: previousRecord.user_code,
          User_Name: previousRecord.user_name,
          Mobile_No: previousRecord.mobile_no,
          Email: previousRecord.email,
          Password: previousRecord.password,
          User_Type: previousRecord.user_type ||"V",
        });
        setEditButtonEnabled(true);  
        setDeleteButtonEnabled(true);
      })
      .catch((error) => {
        console.error("No previous record available.", error);
      });
  };

  const fetchNextRecord = () => {
    axios
      .get(`${apiURL}/get_next_navigation?current_user_code=${employeeDetails.User_Code}`)
      .then((response) => {
        const nextRecord = response.data.nextUserCreation;
        setEmployeeDetails({
          User_Code: nextRecord.user_code,
          User_Name: nextRecord.user_name,
          Mobile_No: nextRecord.mobile_no,
          Email: nextRecord.email,
          Password: nextRecord.password,
          User_Type: nextRecord.user_type ||"V",
        });
        setEditButtonEnabled(true);  
        setDeleteButtonEnabled(true); 
      })
      .catch((error) => {
        console.error("No next record available.", error);
      });
  };

  const location = useLocation();
  const editRecordData = location.state && location.state.editRecordData;

  console.log("editrecorddata", editRecordData);

  useEffect(() => {
    if (editRecordData) {
      setEmployeeDetails({
        User_Code: editRecordData.user_code,
        User_Name: editRecordData.user_name,
        Mobile_No: editRecordData.mobile_no,
        Email: editRecordData.email,
        Password: editRecordData.password,
        User_Type: editRecordData.user_type ||"V",
      });
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setCancelButtonClicked(true);
    } else {
      handleAddOne();
    }
  }, [editRecordData]);

  return (
    <>
      <ToastContainer />
      <div className="user-container">
        <div className="button-container">
          {/* Action Button Group */}
          <ActionButtonGroup
            handleAddOne={handleAddOne}
            addOneButtonEnabled={addOneButtonEnabled}
            handleSaveOrUpdate={handleSaveOrUpdate}
            saveButtonEnabled={saveButtonEnabled}
            isEditMode={isEditMode}
            handleEdit={handleEdit}
            editButtonEnabled={editButtonEnabled}
            handleDelete={handleDelete}  
            deleteButtonEnabled={deleteButtonEnabled}
            handleCancel={handleCancel}
            cancelButtonEnabled={cancelButtonEnabled}
            handleBack={() => navigate("/usercreationutility")}
            backButtonEnabled={backButtonEnabled}
          />

          {/* Navigation Buttons */}
          <NavigationButtons
            handleFirstButtonClick={fetchFirstRecord}
            handlePreviousButtonClick={fetchPreviousRecord}
            handleNextButtonClick={fetchNextRecord}
            handleLastButtonClick={fetchLastRecord}
          />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="user-form-group">
            <label>Employee Code:</label>
            <input
              type="text"
              className="form-control"
              name="employeeCode"
              value={employeeDetails.User_Code}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div className="user-form-group">
            <label>User Full Name:</label>
            <input
              type="text"
              className={`form-control ${isEditing ? "input-focused" : ""}`}
              name="User_Name"
              value={employeeDetails.User_Name}
              onChange={handleInputChange}
              disabled={!isEditing}
              ref={UserFullnameRef}
              autoFocus
            />
          </div>

          <div className="user-form-group">
            <label>Password:</label>
            <input
              type="password"
              className="form-control"
              name="Password"
              value={employeeDetails.Password}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="user-form-group">
            <label>Email Id:</label>
            <input
              type="text"
              className="form-control"
              name="Email"
              value={employeeDetails.Email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="user-form-group">
            <label>Mobile No:</label>
            <input
              type="text"
              className="form-control"
              name="Mobile_No"
              value={employeeDetails.Mobile_No}
              onChange={handleInputChange}
              maxLength="10"
              disabled={!isEditing}
            />
          </div>

          <div className="user-form-group">
            <label>User Type:</label>
            <select
              className="form-select"
              name="User_Type"
              value={employeeDetails.User_Type}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              
              <option value="A">Admin</option>
              <option value="E">Editor</option>
              <option value="V">Viewer</option>
            </select>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserCreationComponent;
