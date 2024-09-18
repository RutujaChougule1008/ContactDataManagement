import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../App.css"
var employeeCodeNew = "";

const UserCreationCompoenent = () => {
  const apiURL = process.env.REACT_APP_API_URL;
  const addNewButtonRef = useRef(null);
  const resaleMillDropdownRef = useRef(null);
  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(true);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  const [editedrecord, setEditedrecord] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [lastEmployeeCode, setLastEmployeeCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const editButtonRef = useRef(null);
  const updateButtonRef = useRef(null);
  const UserFullnameRef = useRef(null)

  const [employeeDetails, setEmployeeDetails] = useState({
    User_Code: "",
    User_Name: "",
    Mobile_No: "",
    Email: "",
    Password: "",
    User_Type: "U",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Check if the entered value is a valid integer for the mobile number
    if (name === "Mobile_No" && !/^\d*$/.test(value)) {
      // If not a valid integer, don't update the state
      return;
    }
  
    setEmployeeDetails({
      ...employeeDetails,
      [name]: value,
    });
  };
  

  const handleAddOne = () => {
    // Disable and enable buttons as needed
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);

    // Focus on the dropdown if it exists
    if (resaleMillDropdownRef.current) {
      resaleMillDropdownRef.current.focus();
    }

    // Fetch the last employee code from the API
    axios
      .get(`${apiURL}/api/employees/lastusercode`)
      .then((response) => {
        // Assuming the API response contains the last employee code
        const lastEmployeeCode = response.data.lastUserCreation;

        // Set the last employee code to the employeeDetails
        setEmployeeDetails({
          User_Code: lastEmployeeCode + 1,
          User_Name: "",
          Mobile_No: "",
          Email: "",
          Password: "",
          User_Type: "U",
        });
        setCurrentIndex(response.data.length - 1);
      })
      .catch((error) => {
        console.error("Error fetching last employee code:", error);
      });
  };

  const handleEdit = () => {
    // Set editing mode to true
    setIsEditing(true);
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setBackButtonEnabled(true);
    employeeCodeNew = employeeDetails.User_Code
   
  };

  useEffect(() => {
    if (isEditMode) {
      UserFullnameRef.current.focus();
    }
    else{
      addNewButtonRef.current.focus();
    }
}, [isEditMode]);
  

  const handleSaveOrUpdate = () => {
    if (isEditMode) {
      axios
        .put(
          `${apiURL}/api/employees/updateuser/${employeeCodeNew}`,
          employeeDetails
        )
        .then((response) => {
          //console.log("Data updated successfully:", response.data);
          setIsEditMode(false);
          setAddOneButtonEnabled(true);
          setEditButtonEnabled(true);
          setDeleteButtonEnabled(true);
          setBackButtonEnabled(true);
          setSaveButtonEnabled(false);
          setCancelButtonEnabled(false);
          setUpdateButtonClicked(true);
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    } else {
      axios
        .post(`${apiURL}/api/employees/insertnewuser`, employeeDetails)
        .then((response) => {
          //console.log("Data saved successfully:", response.data);
          window.alert("Data saved successfully!");
          window.location.reload();
          setIsEditMode(false);
          setAddOneButtonEnabled(true);
          setEditButtonEnabled(true);
          setDeleteButtonEnabled(true);
          setBackButtonEnabled(true);
          setSaveButtonEnabled(false);
          setCancelButtonEnabled(false);
          addNewButtonRef.current.focus();
          setSaveButtonClicked(true);
          setIsEditing(true);
        })
        .catch((error) => {
          console.error("Error saving data:", error);
        });
    }
  };

  const handleBack = () => {
    navigate("/user_Creation_utility");
  };

  const handleDelete = () => {
   // console.log("Deleted");
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    axios
      .delete(`${apiURL}/api/employees/deleteuser/${employeeDetails.User_Code}`)
      .then((response) => {
        //console.log("User deleted successfully:", response.data);
        window.alert("User deleted successfully")
        // window.location.reload();
        handleCancel()
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
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
    setIsEditing(false);
   
    // Use Axios to make a GET request to fetch the last record
    axios
      .get(`${apiURL}/api/employees/getlastrecordbyuserid`)
      .then((response) => {
        // Assuming the response contains the last record data
        const lastRecord = response.data.lastUserCreation;
        employeeCodeNew = response.data.lastUserCreation.employeeCode;
        setEmployeeDetails({
          User_Code: lastRecord.User_Code,
          User_Name: lastRecord.User_Name,
          Mobile_No: lastRecord.Mobile_No,
          Email: lastRecord.Email,
          Password: lastRecord.Password,
          User_Type: lastRecord.User_Type,
        });
        editButtonRef.current.focus();
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };
  const handleButtonClick = (button) => {
    setHighlightedButton(button);
  };
  const handleKeyDown = (event, handler) => {
    if (event.key === "Enter") {
      handler();
      addNewButtonRef.current.focus();
      if (handler === handleAddOne || handler === handleEdit) {
        if (resaleMillDropdownRef.current) {
          resaleMillDropdownRef.current.focus();
        }
      }
    }
  };

  const location = useLocation();
  const editRecordData = location.state && location.state.editRecordData;

  useEffect(() => {
    if (editRecordData) {
      setEmployeeDetails({
        ...editRecordData,
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

  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [records, setRecords] = useState([]);

  const fetchFirstRecord = () => {
    axios.get(`${apiURL}/api/employees/getfirstnavigation`).then((response) => {
      const firstRecord = response.data.firstUserCreation;
      setEmployeeDetails(firstRecord);
      setRecords([firstRecord]);
      setCurrentRecordIndex(0);
    });
  };

  const fetchLastRecord = () => {
    axios.get(`${apiURL}/api/employees/getlastnavigation`).then((response) => {
      const lastRecord = response.data.lastUserCreation;
      setEmployeeDetails(lastRecord);
      setRecords([lastRecord]);
      setCurrentRecordIndex(0);
    });
  };

  const fetchPreviousRecord = async () => {
    // const currentEmployeeCode = records[currentRecordIndex].employeeCode;
    const response = await axios.get(
      `${apiURL}/api/employees/getpreviousnavigation/${employeeDetails.User_Code}`
    );

    if (response.data.previousUserCreation) {
      const previousRecord = response.data.previousUserCreation;
      setEmployeeDetails(previousRecord);
      setCurrentRecordIndex(currentRecordIndex - 1);
    } else {
      console.log("No previous record available.");
    }
  };

  const fetchNextRecord = async () => {
    // const currentEmployeeCode = records[currentRecordIndex].employeeCode;
    const response = await axios.get(
      `${apiURL}/api/employees/getnextnavigation/${employeeDetails.User_Code}`
    );

    if (response.data.nextUserCreation) {
      const nextRecord = response.data.nextUserCreation;
      setEmployeeDetails(nextRecord);
      setCurrentRecordIndex(currentRecordIndex + 1);
    } else {
      console.log("No next record available.");
    }
  };

  const handleFirst = () => {
    fetchFirstRecord();
  };

  const handleLast = () => {
    fetchLastRecord();
  };

  const handlePrevious = () => {
    fetchPreviousRecord();
  };

  const handleNext = () => {
    fetchNextRecord();
  };

  return (
    <>
      <div>
        <h3 className="mt-4 mb-4 text-center custom-heading">
          New User Creation
        </h3>
        <div
          style={{
            marginTop: "30px",
            marginBottom: "10px",
            display: "flex",
            gap: "10px",
            marginLeft: "600px",
          }}
        >
          <button
            onClick={handleAddOne}
            ref={addNewButtonRef}
            disabled={!addOneButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleAddOne)}
            tabIndex={0}
            style={{
              backgroundColor: addOneButtonEnabled ? "blue" : "white",
              color: addOneButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: "pointer",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Add
          </button>
          {isEditMode ? (
            <button
              onClick={handleSaveOrUpdate}
              tabIndex="6"
              onKeyDown={(event) => handleKeyDown(event, handleSaveOrUpdate)}
              style={{
                backgroundColor: "blue",
                color: "white",
                border: "1px solid #ccc",
                cursor: "pointer",
                width: "6%",
                height: "35px",
                fontSize: "12px",
              }}
            >
              update
            </button>
          ) : (
            <button
              onClick={handleSaveOrUpdate}
              disabled={!saveButtonEnabled}
              onKeyDown={(event) => handleKeyDown(event, handleSaveOrUpdate)}
              tabIndex="6"
              style={{
                backgroundColor: saveButtonEnabled ? "blue" : "white",
                color: saveButtonEnabled ? "white" : "black",
                border: "1px solid #ccc",
                cursor: saveButtonEnabled ? "pointer" : "not-allowed",
                width: "6%",
                height: "35px",
                fontSize: "12px",
              }}
            >
              Save
            </button>
          )}
          <button
             ref={editButtonRef}
            onClick={handleEdit}
            disabled={!editButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleEdit)}
            style={{
              backgroundColor: editButtonEnabled ? "blue" : "white",
              color: editButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: editButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={!deleteButtonEnabled}
            style={{
              backgroundColor: deleteButtonEnabled ? "blue" : "white",
              color: deleteButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: deleteButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Delete
          </button>
          <button
            onClick={handleCancel}
            disabled={!cancelButtonEnabled}
         
            onKeyDown={(event) => handleKeyDown(event, handleCancel)}
            tabIndex="7"
            style={{
              backgroundColor: cancelButtonEnabled ? "blue" : "white",
              color: cancelButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: cancelButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Cancel
          </button>
          <button
        
            onClick={handleBack}
            disabled={!backButtonEnabled}
            onKeyDown={(event) => handleKeyDown(event, handleBack)}
            tabIndex="8"
            style={{
              backgroundColor: backButtonEnabled ? "blue" : "white",
              color: backButtonEnabled ? "white" : "black",
              border: "1px solid #ccc",
              cursor: backButtonEnabled ? "pointer" : "not-allowed",
              width: "6%",
              height: "35px",
              fontSize: "12px",
            }}
          >
            Back
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginLeft: "100px",
            }}
          >
            <button
              onClick={handleFirst}
              tabIndex="9"
              style={{
                backgroundColor:"blue",
                color: "white",
                border: "1px solid #ccc",
                cursor: "pointer",
                width: "200px",
                height: "35px",
                fontSize: "12px",
              }}
             
            >
              &lt;&lt;
            </button>
            <button
              onClick={handlePrevious}
              tabIndex="10"
              style={{
                backgroundColor: "blue",
                color: "white",
                border: "1px solid #ccc",
                cursor: "pointer",
                width: "100%",
                height: "35px",
                fontSize: "12px",
                marginLeft: "5px",
              }}
             
            >
              &lt;
            </button>
            <button
              onClick={handleNext}
              tabIndex="11"
              style={{
                backgroundColor: "blue",
                color: "white",
                border: "1px solid #ccc",
                cursor: "pointer",
                width: "100%",
                height: "35px",
                fontSize: "12px",
                marginLeft: "5px",
              }}
            >
              &gt;
            </button>
            <button
              onClick={handleLast}
              tabIndex="12"
              style={{
                backgroundColor: "blue",
                color: "white",
                border: "1px solid #ccc",
                cursor: "pointer",
                width: "100%",
                height: "35px",
                fontSize: "12px",
                marginLeft: "5px",
              }}
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          marginLeft: "500px",
        }}
      >
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <label className="form-label col-md-2" style={{ fontWeight: 'bold' }}>Employee Code:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="employeeCode"
                  value={employeeDetails.User_Code}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2" style={{ fontWeight: 'bold' }}>User Full Name:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className={`form-control ${isEditing ? "input-focused" : ""}`} 
                  name="User_Name"
                  value={employeeDetails.User_Name}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                  tabIndex="1"
                  ref={UserFullnameRef}
                  autoFocus
                 
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2" style={{ fontWeight: 'bold' }}>Password:</label>
              <div className="col-md-4">
                <input
                  type="password"
                  className="form-control"
                  name="Password"
                  value={employeeDetails.Password}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                  tabIndex="2"
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2" style={{ fontWeight: 'bold' }}>Email Id:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="Email"
                  value={employeeDetails.Email}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                  tabIndex="3"
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2" style={{ fontWeight: 'bold' }}>Mobile No:</label>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  name="Mobile_No"
                  value={employeeDetails.Mobile_No}
                  onChange={handleInputChange}
                  autoComplete="off"
                  maxLength="10"
                  disabled={!isEditing}
                  tabIndex="4"
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="form-label col-md-2" style={{ fontWeight: 'bold' }}>User Type:</label>
              <div className="col-md-4">
                <select
                  className="form-select"
                  name="User_Type"
                  value={employeeDetails.User_Type}
                  onChange={handleInputChange}
                  autoComplete="off"
                  disabled={!isEditing}
                  tabIndex="5"
                >
                  <option value="U">User</option>
                  <option value="A">Admin</option>
                </select>
              </div>
            </div>

            <div></div>
          </form>
        </div>
      </div>
    </>
  );
};
export default UserCreationCompoenent;
