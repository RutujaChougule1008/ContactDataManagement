import React, { useState, useEffect } from "react";
import ActionButtonGroup from "../../../common/ActionButtonGroup";
import NavigationButtons from "../../../common/NavigationButtons";
import { useNavigate, useLocation } from "react-router-dom";
import "./EventGroupMaster.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL;

var newEventCode = "";

const EventGroupMaster = () => {
  const userRole = sessionStorage.getItem("user_type");
  const isViewer = userRole === "V";

  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(true);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(false);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;

  const [formData, setFormData] = useState({
    eventName: "",
  });

  useEffect(() => {
    if (selectedRecord) {
      setFormData(selectedRecord);
      setIsEditMode(isViewer ? false : true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
    } else {
      handleAddOne();
    }
  }, [selectedRecord]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (!isEditMode) {
      setSaveButtonEnabled(true);
    }
  };

  const handleAddOne = () => {
    if (isViewer) return;
    setFormData({ eventCode: "", eventName: "" });
    setIsEditMode(false);
    setIsEditing(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
  };

  const handleSaveOrUpdate = () => {
    if (isViewer) return;
    if (isEditMode) {
      axios
        .put(`${API_URL}/update-eventgroup/${newEventCode}`, formData)
        .then((response) => {
          toast.success("Record updated successfully!");
          setUpdateButtonClicked(true);
          setAddOneButtonEnabled(true);
        })
        .catch((error) => {
          toast.error("Error updating data: " + error.message);
        });
    } else {
      axios
        .post(`${API_URL}/create-eventgroup`, formData)
        .then((response) => {
          toast.success("Record created successfully!");
          setSaveButtonClicked(true);
          setAddOneButtonEnabled(true);
        })
        .catch((error) => {
          toast.error("Error creating data: " + error.message);
        });
    }
    resetControls();
  };

  const handleEdit = () => {
    if (isViewer) return;
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setBackButtonEnabled(true);
    setIsEditing(true);
  };

  const handleCancel = () => {
    handleLastButtonClick();
  };

  const handleDelete = () => {
    if (isViewer) return;
    if (window.confirm("Are you sure you want to delete this event?")) {
      axios
        .delete(`${API_URL}/delete-eventgroup?event_code=${newEventCode}`)
        .then(() => {
          toast.success("Record deleted successfully!");
          handleCancel();
        })
        .catch((error) => {
          toast.error("Error deleting event: " + error.message);
        });
    }
  };

  // Navigation functions
  const handleFirstButtonClick = () => {
    axios
      .get(`${API_URL}/get-first-eventgroup`)
      .then((response) => {
        setFormData(response.data);
        newEventCode = response.data.eventCode;
        setIsEditMode(false);
      })
      .catch((error) => {
        toast.error(`Error fetching first record: ${error.message}`);
      });

    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
  };

  const handlePreviousButtonClick = () => {
    axios
      .get(`${API_URL}/get-previous-eventgroup?current_code=${newEventCode}`)
      .then((response) => {
        setFormData(response.data);
        newEventCode = response.data.eventCode;
        setIsEditMode(false);
      })
      .catch((error) => {
        toast.error(`No Previous Record Found`);
      });

    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
  };

  const handleNextButtonClick = () => {
    axios
      .get(`${API_URL}/get-next-eventgroup?current_code=${newEventCode}`)
      .then((response) => {
        setFormData(response.data);
        newEventCode = response.data.eventCode;
        setIsEditMode(false);
      })
      .catch((error) => {
        toast.error(`No Next Record Found`);
      });

    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
  };

  const handleLastButtonClick = () => {
    axios
      .get(`${API_URL}/get-last-eventgroup`)
      .then((response) => {
        setFormData(response.data);
        newEventCode = response.data.eventCode;
        setIsEditMode(false);
      })
      .catch((error) => {
        toast.error(`Error fetching last record: ${error.message}`);
      });
    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
  };

  const resetControls = () => {
    setIsEditMode(false);
    setIsEditing(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
  };

  const handleBack = () => {
    navigate("/calender");
  };

  return (
    <div className="container">
      <ToastContainer />
      <ActionButtonGroup
        handleAddOne={handleAddOne}
        handleSaveOrUpdate={handleSaveOrUpdate}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleCancel={handleCancel}
        addOneButtonEnabled={addOneButtonEnabled}
        saveButtonEnabled={saveButtonEnabled}
        cancelButtonEnabled={cancelButtonEnabled}
        editButtonEnabled={editButtonEnabled}
        deleteButtonEnabled={deleteButtonEnabled}
        backButtonEnabled={backButtonEnabled}
        handleBack={handleBack}
      />
      <NavigationButtons
        handleFirstButtonClick={handleFirstButtonClick}
        handlePreviousButtonClick={handlePreviousButtonClick}
        handleNextButtonClick={handleNextButtonClick}
        handleLastButtonClick={handleLastButtonClick}
      />
      <div className="form-container">
        <form>
          <h2>Category Master</h2>
          <div className="form-group">
            <label htmlFor="eventName">Category</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventGroupMaster;
