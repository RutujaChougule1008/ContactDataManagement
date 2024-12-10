import MotionHoc from "./MotionHoc";
import React, { useMemo } from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../common/ActionButtonGroup";
import NavigationButtons from "../../common/NavigationButtons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HashLoader } from "react-spinners";
import "../Pages/ContactDataDoc.css";
import { useContacts } from "./ContactContext";

const API_URL = process.env.REACT_APP_API_URL;

var newAccoid;
var newDetailId;

const ContactData = ({ ContactIds, closePopup }) => {
  const { selectedContacts } = useContacts(); // Access the selected contacts from context

  // If you still want to use ContactIds prop, you can combine it with selectedContacts
  const contactIdsToUse = ContactIds || selectedContacts

  const userRole = sessionStorage.getItem("user_type"); // Retrieve user role
  const isViewer = userRole === "V";

  const [updateButtonClicked, setUpdateButtonClicked] = useState();
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(true);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(!isViewer);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(true);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(!isViewer);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(!isViewer);
  const companyCode = sessionStorage.getItem("Company_Code");
  const [accountData, setAccountData] = useState({});
  const [accountDetail, setAccountDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);
  const [firstContactData, setFirstContactData] = useState(null); // State for the first contact
  const [secondContactData, setSecondContactData] = useState(null); // State for the second contact
  const [fetchedContactIds, setFetchedContactIds] = useState([]);
  const [imageData, setImageData] = useState({
    profile1: "",
    profile2: "",
    profile3: "",
  });
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [isAnniversaryToday, setIsAnniversaryToday] = useState(false);
  const [specialDates, setSpecialDates] = useState([
    { date: "", description: "" },
  ]);

  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const initialFormData = {
    org_name: "",
    org_holder_name: "",
    designation: "",
    office_address: "",
    city: "",
    state: "",
    country: "",
    residential_addr: "",
    landline_no: "",
    mobile_no: "",
    email: "",
    anniversary: "",
    website: "",
    DOB: "",
    mobile_no2: "",
    email2: "",
    note: "",
    bio: "",
    profile1: null,
    profile2: null,
    profile3: null,
    profile1FileName: "",
    profile2FileName: "",
    profile3FileName: "",
    UCC_Number: "",
    contact_Id:null
  };

  const orgNameRef = useRef(null);

  useEffect(() => {
    if (orgNameRef.current) {
      orgNameRef.current.focus();
    }
  }, []);

  const [formData, setFormData] = useState(initialFormData);
  const [formDataDetail, setFormDataDetail] = useState({
    eventCode: "",
  });
  // Handle change for all inputs
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          [name]: reader.result, // Store base64 string of the image
          [`${name}FileName`]: file.name, // Store the filename in a separate field
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleRemoveSpecialDate = index => {
    setSpecialDates(prevDates => prevDates.filter((_, i) => i !== index));
  };

  // Function to toggle minimization of a special date field
  const handleToggleMinimize = index => {
    setSpecialDates(prevDates =>
      prevDates.map((date, i) =>
        i === index ? { ...date, minimized: !date.minimized } : date
      )
    );
  };


  const handleCheckboxAcGroups = (e, group) => {
    const { checked } = e.target;

    setSelectedGroups((prevSelected) => {
      if (checked) {
        console.log("Adding group to selectedGroups:", group.eventCode);
        return [...prevSelected, group.eventCode];
      } else {
        console.log("Removing group from selectedGroups:", group.eventCode);

        return prevSelected.filter(
          (groupCode) => groupCode !== group.eventCode
        );
      }
    });
    console.log("Selected Groups:", selectedGroups);
  };

  console.log("SelectedGroup", selectedGroups);

  const checkSpecialDates = () => {
    const today = new Date();
    const todayFormatted = `${today.getMonth() + 1}-${today.getDate()}`;

    // Check for Birthday
    if (formData.DOB) {
      const birthday = new Date(formData.DOB);
      const birthdayFormatted = `${
        birthday.getMonth() + 1
      }-${birthday.getDate()}`;
      if (birthdayFormatted === todayFormatted) {
        setIsBirthdayToday(true);
      } else {
        setIsBirthdayToday(false);
      }
    }

    // Check for Anniversary
    if (formData.anniversary) {
      const anniversary = new Date(formData.anniversary);
      const anniversaryFormatted = `${
        anniversary.getMonth() + 1
      }-${anniversary.getDate()}`;
      if (anniversaryFormatted === todayFormatted) {
        setIsAnniversaryToday(true);
      } else {
        setIsAnniversaryToday(false);
      }
    }
  };

  useEffect(() => {
    checkSpecialDates();
  }, [formData.DOB, formData.anniversary]);

  const handleSpecialDateChange = (index, field, value) => {
    const updatedSpecialDates = [...specialDates];
    updatedSpecialDates[index][field] = value;
    setSpecialDates(updatedSpecialDates);
  };

  // Add new special date fields
  const handleAddSpecialDate = () => {
    setSpecialDates([...specialDates, { date: "", description: "" }]);
  };

  const handleRemoveImage = (imageKey) => {
    setFormData((prevData) => ({
      ...prevData,
      [imageKey]: null,
      [`${imageKey}FileName`]: "",

    }));
  };

  const fetchLastRecord = () => {
    fetch(`${API_URL}/next-contact-id`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch last record");
            }
            return response.json();
        })
        .then((data) => {
            setFormData((prevState) => ({
                ...prevState,
                contact_Id: data.nextContactId
            }));
        })
        .catch((error) => {
            console.error("Error fetching last record:", error);
        });
};

  

  const handleAddOne = () => {
    if (isViewer) return;
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);
    setFormData(initialFormData);
    fetchLastRecord();
    setAccountDetail([]);
    setSelectedGroups([]);
    setImageData({});
    setIsBirthdayToday(false);
    setIsAnniversaryToday(false);
  };

  const handleSaveOrUpdate = async () => {
    if (isViewer) return;
    setIsEditing(true);
    setIsLoading(true);

    // Create a new FormData object to handle multipart data
    const formDataToSend = new FormData();

    // Append the master_data as a JSON string
    formDataToSend.append("master_data", JSON.stringify(formData));

    // Append the contact_data as a JSON string
    const contactDataArray = Array.from(selectedGroups).map((groupCode) => {
      const detail = accountDetail.find((d) => d.eventCode === groupCode);
      return {
        eventCode: [groupCode],
        contactdetail_id: detail ? detail.contactdetail_id : null,
        rowaction: detail ? "update" : "add",
      };
    });

    formDataToSend.append("special_dates", JSON.stringify(specialDates));

    formDataToSend.append("contact_data", JSON.stringify(contactDataArray));

    // Append the binary files (profile images) if they exist
    if (formData.profile1) formDataToSend.append("profile1", formData.profile1);
    if (formData.profile2) formDataToSend.append("profile2", formData.profile2);
    if (formData.profile3) formDataToSend.append("profile3", formData.profile3);

    try {
      let response;

      if (isEditMode) {
        delete formData.contact_Id;
        const updateApiUrl = `${API_URL}/update-contactData?contact_Id=${newAccoid}`;
        response = await axios.put(updateApiUrl, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure the correct content type is set
          },
        });
        toast.success("Data updated successfully!");
      } else {
        response = await axios.post(
          `${API_URL}/insert-contactData`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Ensure the correct content type is set
            },
          }
        );
        toast.success("Data saved successfully!");
      }

      // Handle the response or refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      setIsEditing(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(`Error occurred while saving data: ${error.message}`);
      setIsLoading(false);
    }
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
    axios
      .get(`${API_URL}/get-lastcontactdata`)
      .then((response) => {
        const data = response.data.account_master_data;
        const detailData = response.data.account_detail_data || [];
        const specialDatesData = response.data.special_date || [];

        newAccoid = data.contact_Id;

        newDetailId =
          detailData.length > 0 && detailData[0].contactdetail_id
            ? detailData[0].contactdetail_id
            : null;
        console.log(data);

        setFormData({
          ...formData,
          ...data,
          profile1: data.profile1
            ? `data:image/jpeg;base64,${data.profile1}`
            : null,
          profile2: data.profile2
            ? `data:image/jpeg;base64,${data.profile2}`
            : null,
          profile3: data.profile3
            ? `data:image/jpeg;base64,${data.profile3}`
            : null,
        });

        setAccountData(data || {});
        setAccountDetail(detailData || []);

        console.log("Account Detail", detailData);

        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);
        const formattedSpecialDates = specialDatesData.map((specialDate) => ({
          date: specialDate.special_date || "",
          description: specialDate.description || "",
        }));
        setSpecialDates(formattedSpecialDates);
      })
      .catch((error) => {
        console.error("Error fetching latest data for edit:", error);
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

  const fetchGroupData = () => {
    axios
      .get(`${API_URL}/event_groups`)
      .then((response) => {
        const data = response.data;
        setGroupData(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching latest data for edit:", error);
      });
  };

  const handleDelete = async () => {
    if (isViewer) return;
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this record ${newAccoid}?`
    );

    if (isConfirmed) {
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);

      try {
        const deleteApiUrl = `${API_URL}/delete_contactData?contact_Id=${newAccoid}`;
        const response = await axios.delete(deleteApiUrl);
        toast.success("Record deleted successfully!");
        handleCancel();
        closePopup();
      } catch (error) {
        console.error("Error during API call:", error);
      }
    } else {
      console.log("Deletion cancelled");
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  const handleBack = () => {
    navigate("/documents");
  };

  //Handle Record DoubleCliked in Utility Page Show that record for Edit
  const handlerecordDoubleClicked = async () => {
    if (isViewer) {
      handleCancel();
      return;
    }
    try {
      const response = await axios.get(
        `${API_URL}/getcontactDataByid?contact_Id=${selectedRecord.contact_Id}`
      );
      const data = response.data.account_master_data;
      const detailData = response.data.account_detail_data || [];
      const specialDatesData = response.data.special_date || [];

      newAccoid = data.contact_Id;

      newDetailId =
        detailData.length > 0 && detailData[0].contactdetail_id
          ? detailData[0].contactdetail_id
          : null;
      console.log(data);

      setFormData({
        ...formData,
        ...data,
        profile1: data.profile1
          ? `data:image/jpeg;base64,${data.profile1}`
          : null,
        profile2: data.profile2
          ? `data:image/jpeg;base64,${data.profile2}`
          : null,
        profile3: data.profile3
          ? `data:image/jpeg;base64,${data.profile3}`
          : null,
      });

      setAccountData(data || {});
      setAccountDetail(detailData || []);

      console.log("Account Detail", detailData);

      const eventCodes = detailData
        .map((detail) => detail.eventCode)
        .filter((eventCode) => eventCode !== null && eventCode !== undefined);

      setSelectedGroups(eventCodes || []);
      setSelectedGroups(eventCodes || []);
      const formattedSpecialDates = specialDatesData.map((specialDate) => ({
        date: specialDate.special_date || "",
        description: specialDate.description || "",
      }));
      setSpecialDates(formattedSpecialDates);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setIsEditMode(!isViewer ? true : false);
    setAddOneButtonEnabled(false);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(!isViewer ? false : true);
    setUpdateButtonClicked(!isViewer ? true : false);
    setIsEditing(!isViewer ? true : false);
  };

  useEffect(() => {
    if (selectedRecord) {
      handlerecordDoubleClicked();
    } else {
      handleAddOne();
    }
  }, [selectedRecord]);

  //Navigation Buttons
  const handleFirstButtonClick = async () => {
    try {
      const response = await fetch(`${API_URL}/get-firstcontact-navigation`);
      if (response.ok) {
        const data = await response.json();

        const accountMasterData = data.account_master_data;
        const detailData = data.account_detail_data || [];
        const specialDatesData = data.special_date || [];

        newAccoid = accountMasterData.contact_Id;
        newDetailId =
          detailData.length > 0 && detailData[0].contactdetail_id
            ? detailData[0].contactdetail_id
            : null;

        console.log("Account Master Data:", accountMasterData);
        console.log("Detail Data:", detailData);

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...accountMasterData,
          profile1: data.accountMasterData
            ? `data:image/jpeg;base64,${data.profile1}`
            : null,
          profile2: data.accountMasterData
            ? `data:image/jpeg;base64,${data.profile2}`
            : null,
          profile3: data.accountMasterData
            ? `data:image/jpeg;base64,${data.profile3}`
            : null,
        }));

        setAccountData(accountMasterData || {});
        setAccountDetail(detailData || []);

        // Map event codes from detail data (filtering out any null/undefined eventCode values)
        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);
        const formattedSpecialDates = specialDatesData.map((specialDate) => ({
          date: specialDate.special_date || "",
          description: specialDate.description || "",
        }));
        setSpecialDates(formattedSpecialDates);
      } else {
        console.error(
          "Failed to fetch first record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handlePreviousButtonClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-previouscontact-navigation?current_contactId=${newAccoid}`
      );

      if (response.ok) {
        const data = await response.json();

        const accountMasterData = data.account_master_data;
        const detailData = data.account_detail_data || [];
        const specialDatesData = data.special_date || [];

        newAccoid = accountMasterData.contact_Id;
        newDetailId =
          detailData.length > 0 && detailData[0].contactdetail_id
            ? detailData[0].contactdetail_id
            : null;

        console.log("Account Master Data:", accountMasterData);
        console.log("Detail Data:", detailData);

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...accountMasterData,
          profile1: data.accountMasterData
            ? `data:image/jpeg;base64,${data.profile1}`
            : null,
          profile2: data.accountMasterData
            ? `data:image/jpeg;base64,${data.profile2}`
            : null,
          profile3: data.accountMasterData
            ? `data:image/jpeg;base64,${data.profile3}`
            : null,
        }));

        setAccountData(accountMasterData || {});
        setAccountDetail(detailData || []);

        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);

        const formattedSpecialDates = specialDatesData.map((specialDate) => ({
          date: specialDate.special_date || "",
          description: specialDate.description || "",
        }));
        setSpecialDates(formattedSpecialDates);
      } else {
        console.error(
          "Failed to fetch previous record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handleNextButtonClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-nextcontact-navigation?current_contactId=${newAccoid}`
      );

      if (response.ok) {
        const data = await response.json();

        const accountMasterData = data.account_master_data;
        const detailData = data.account_detail_data || [];
        const specialDatesData = data.special_date || [];

        newAccoid = accountMasterData.contact_Id;
        newDetailId =
          detailData.length > 0 && detailData[0].contactdetail_id
            ? detailData[0].contactdetail_id
            : null;

        console.log("Account Master Data:", accountMasterData);
        console.log("Detail Data:", detailData);

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...accountMasterData,
          profile1: accountMasterData.profile1
            ? `data:image/jpeg;base64,${accountMasterData.profile1}`
            : null,
          profile2: accountMasterData.profile2
            ? `data:image/jpeg;base64,${accountMasterData.profile2}`
            : null,
          profile3: accountMasterData.profile3
            ? `data:image/jpeg;base64,${accountMasterData.profile3}`
            : null,
        }));

        setAccountData(accountMasterData || {});
        setAccountDetail(detailData || []);

        // Map event codes from detail data (filtering out any null/undefined eventCode values)
        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);

        const formattedSpecialDates = specialDatesData.map((specialDate) => ({
          date: specialDate.special_date || "",
          description: specialDate.description || "",
        }));
        setSpecialDates(formattedSpecialDates);
      } else {
        console.error(
          "Failed to fetch next record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  useEffect(() => {
    const fetchContactData = async (id) => {
      try {
        console.log("Fetching data for Contact ID:", id); // Log the contact ID being fetched
        const response = await axios.get(`${API_URL}/getcontactDataByid?contact_Id=${id}`);
        const { account_master_data, account_detail_data, special_date } = response.data;

        setFormData((prevFormData) => ({
          ...prevFormData,
          ...account_master_data,
          profile1: account_master_data.profile1
            ? `data:image/jpeg;base64,${account_master_data.profile1}`
            : null,
          profile2: account_master_data.profile2
            ? `data:image/jpeg;base64,${account_master_data.profile2}`
            : null,
          profile3: account_master_data.profile3
            ? `data:image/jpeg;base64,${account_master_data.profile3}`
            : null,
        }));

        setAccountDetail(account_detail_data || []);
        const eventCodes = account_detail_data
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);
        setSelectedGroups(eventCodes || []);

        const formattedSpecialDates = special_date.map((specialDate) => ({
          date: specialDate.special_date || "",
          description: specialDate.description || "",
        }));
        setSpecialDates(formattedSpecialDates);

        setFetchedContactIds((prevFetched) => [...prevFetched, id]); // Track this ID as fetched
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };

    // Fetch data for the provided ContactIds
    if (contactIdsToUse && contactIdsToUse.length > 0) {
      contactIdsToUse.forEach((id) => {
        if (!fetchedContactIds.includes(id)) {
          fetchContactData(id); // Fetch only if not already fetched
        }
      });
    }
  }, [contactIdsToUse, fetchedContactIds]);
  
  return (
    <>
      <ToastContainer />
      {/* <button className="eTenderButton" onClick={handleEtender}>eTender</button> */}
      <div style={{marginLeft:"80px"}}>
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
          handleBack={handleBack}
          backButtonEnabled={backButtonEnabled}
          isViewer={isViewer}
        />

        {/* Navigation Buttons */}
        <NavigationButtons
          handleFirstButtonClick={handleFirstButtonClick}
          handlePreviousButtonClick={handlePreviousButtonClick}
          handleNextButtonClick={handleNextButtonClick}
          handleLastButtonClick={handleCancel}
          highlightedButton={highlightedButton}
          isEditing={isEditing}
          isFirstRecord={formData.company_code === 1}
        />
      </div>

      <div className="contact-data-form-container">
        <form>
        <div className="contact-data-form-group">
            <label htmlFor="contact_Id">Contact Id:</label>
            <input
              type="text"
              id="contact_Id"
              name="contact_Id"
              ref={orgNameRef}
              value={formData.contact_Id}
              onChange={handleChange}
              disabled={true}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="org_name">Organization Name:</label>
            <input
              type="text"
              id="org_name"
              name="org_name"
              ref={orgNameRef}
              value={formData.org_name}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="org_holder_name">Holder's Name:</label>
            <input
              type="text"
              id="org_holder_name"
              name="org_holder_name"
              value={formData.org_holder_name}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="designation">Designation:</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="office_address">Office Address:</label>
            <input
              type="text"
              id="office_address"
              name="office_address"
              value={formData.office_address}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="city">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="state">State:</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="country">Country:</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="residential_addr">Residential Address:</label>
            <input
              type="text"
              id="residential_addr"
              name="residential_addr"
              value={formData.residential_addr}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="landline_no">Telephone No:</label>
            <input
              type="text"
              id="landline_no"
              name="landline_no"
              value={formData.landline_no}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="mobile_no">Primary Mobile No:</label>
            <input
              type="text"
              id="mobile_no"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              maxLength={10}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="mobile_no2">Secondary Mobile No:</label>
            <input
              type="text"
              id="mobile_no2"
              name="mobile_no2"
              value={formData.mobile_no2}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              maxLength={10}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="email">Primary Mail Id</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="email2">Secondary Email Id:</label>
            <input
              type="text"
              id="email2"
              name="email2"
              value={formData.email2}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="UCC_Number">UCC Number</label>
            <input
              type="text"
              id="UCC_Number"
              name="UCC_Number"
              value={formData.UCC_Number}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>

          <div className="contact-data-form-group">
            <label htmlFor="anniversary">Annivesray:</label>
            <input
              type="date"
              id="anniversary"
              name="anniversary"
              value={formData.anniversary || ""}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          {isAnniversaryToday && (
            <div className="special-notification">
              💍 Today is the Anniversary of{" "}
              {formData.org_holder_name || "this contact"}!
            </div>
          )}

          <div className="contact-data-form-group">
            <label htmlFor="website">Website URL:</label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>

          <div className="contact-data-form-group">
            <label htmlFor="DOB">DOB:</label>
            <input
              type="Date"
              id="DOB"
              name="DOB"
              value={formData.DOB || ""}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          {isBirthdayToday && (
            <div className="special-notification">
              🎉 Today is the Birthday of{" "}
              {formData.org_holder_name || "this contact"}!
            </div>
          )}
          {/* {specialDates.map((specialDate, index) => (
            
            <div key={index} className="special-date-entry">
              <div className="contact-data-form-group">
                <label htmlFor={`special_date_${index}`}>Special Date:</label>
                <input
                  type="date"
                  id={`special_date_${index}`}
                  name={`special_date_${index}`}
                  value={specialDate.date}
                  onChange={(e) =>
                    handleSpecialDateChange(index, "date", e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="contact-data-form-group">
                <label htmlFor={`special_date_${index}_description`}>
                  Description:
                </label>
                <input
                  type="text"
                  id={`special_date_${index}_description`}
                  name={`special_date_${index}_description`}
                  value={specialDate.description}
                  onChange={(e) =>
                    handleSpecialDateChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="add-special-date-button"
            onClick={handleAddSpecialDate}
            disabled={!isEditing}
          >
            + Add Special Date
          </button> */}

{specialDates.map((specialDate, index) => (
  <div key={index} className="special-date-entry">
    <button type="button" onClick={() => handleToggleMinimize(index)} className="minimize-button">
      {specialDate.minimized ? 'Expand' : 'Minimize'}
    </button>
    <button type="button" onClick={() => handleRemoveSpecialDate(index)} className="remove-button">
      Remove
    </button>
    {!specialDate.minimized && (
      <>
        <div className="contact-data-form-group">
          <label htmlFor={`special_date_${index}`}>Special Date:</label>
          <input
            type="date"
            id={`special_date_${index}`}
            name={`special_date_${index}`}
            value={specialDate.date}
            onChange={(e) => handleSpecialDateChange(index, "date", e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="contact-data-form-group">
          <label htmlFor={`special_date_${index}_description`}>
            Description:
          </label>
          <input
            type="text"
            id={`special_date_${index}_description`}
            name={`special_date_${index}_description`}
            value={specialDate.description}
            onChange={(e) => handleSpecialDateChange(index, "description", e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </>
    )}
  </div>
))}

<button
  type="button"
  className="add-special-date-button"
  onClick={handleAddSpecialDate}
  disabled={!isEditing}
>
  + Add Special Date
</button>


          <div className="contact-data-form-group">
            <label htmlFor="note">Note:</label>
            <textarea
              type="text"
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              rows={3}
            />
          </div>
          <div className="contact-data-form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              type="text"
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              rows={3}
            />
          </div>
          <div className="contact-data-form-group">
            <div className="profile-input-container">
              <label htmlFor="profile1">Upload Profile 1:</label>
              <input
                type="file"
                id="profile1"
                name="profile1"
                accept="image/*"
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
            {/* {formData.profile1 && (
              <div className="profile-image-container">
                <img src={formData.profile1} alt="Profile 1" />
                <p>{formData.profile1FileName}</p>
              </div>
            )} */}
            {formData.profile1 && (
    <div className="profile-image-container">
      <img src={formData.profile1} alt="Profile 1" />
      <p>{formData.profile1FileName}</p>
      <button type="button" onClick={() => handleRemoveImage('profile1')} className="remove-image-button">
        Remove
      </button>
    </div>
  )}
          </div>

          <div className="contact-data-form-group">
            <div className="profile-input-container">
              <label htmlFor="profile2">Upload Profile 2:</label>
              <input
                type="file"
                id="profile2"
                name="profile2"
                accept="image/*"
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
            {/* {formData.profile2 && (
              <div className="profile-image-container">
                <img src={formData.profile2} alt="Profile 2" />
                <p>{formData.profile2FileName}</p>
              </div>
            )} */}
            {formData.profile2 && (
    <div className="profile-image-container">
      <img src={formData.profile2} alt="Profile 2" />
      <p>{formData.profile2FileName}</p>
      <button type="button" onClick={() => handleRemoveImage('profile2')} className="remove-image-button">
        Remove
      </button>
    </div>
  )}
          </div>

          <div className="contact-data-form-group">
            <div className="profile-input-container">
              <label htmlFor="profile3">Upload Profile 3:</label>
              <input
                type="file"
                id="profile3"
                name="profile3"
                accept="image/*"
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
            {/* {formData.profile3 && (
              <div className="profile-image-container">
                <img src={formData.profile3} alt="Profile 3" />
                <p>{formData.profile3FileName}</p>
              </div>
            )} */}
            {formData.profile3 && (
    <div className="profile-image-container">
      <img src={formData.profile3} alt="Profile 3" />
      <p>{formData.profile3FileName}</p>
      <button type="button" onClick={() => handleRemoveImage('profile3')} className="remove-image-button">
        Remove
      </button>
    </div>
  )}
          </div>

          <div className="contact-data-form-table ">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Event Group Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupData.map((group, index) => (
                  <tr key={group.eventCode}>
                    <td>{group.eventCode}</td>
                    <td>{group.eventName}</td>
                    {/* <td>{group.contact_Id}</td> */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.eventCode)}
                        onChange={(e) => handleCheckboxAcGroups(e, group)}
                        disabled={!isEditing && addOneButtonEnabled}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner-container">
              <HashLoader color="#007bff" loading={isLoading} size={80} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const ContactDataDoc = MotionHoc(ContactData);

export default ContactDataDoc;
