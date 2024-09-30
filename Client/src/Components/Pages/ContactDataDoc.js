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

const ContactData = ({ ContactIds, closePopup  }) => {
  const { selectedContacts } = useContacts(); // Access the selected contacts from context

  // If you still want to use ContactIds prop, you can combine it with selectedContacts
  const contactIdsToUse = ContactIds || selectedContacts;

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
  const [isEditing, setIsEditing] = useState(false);
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
  const [error, setError] = useState(null); // Error state

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
    note:"",
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
    const { name, value } = event.target;
    setFormData((prevState) => {
      const updatedFormData = { ...prevState, [name]: value };
      return updatedFormData;
    });
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

  const handleAddOne = () => {
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditing(true);
    setFormData(initialFormData);
    setAccountDetail([]);
    setSelectedGroups([]);
  };

  const handleSaveOrUpdate = async () => {
    setIsEditing(true);
    setIsLoading(true);

    const master_data = { ...formData };

    if (isEditMode) {
      delete master_data.contact_Id;
    }

    const contact_data = Array.from(selectedGroups).map((groupCode) => {
      const detail = accountDetail.find((d) => d.eventCode === groupCode);
      return {
        eventCode: [groupCode],
        contactdetail_id: detail ? detail.contactdetail_id : null,
        rowaction: detail ? "update" : "add",
      };
    });

    if (isEditMode) {
      const deselectedGroups = accountDetail
        .filter((detail) => !selectedGroups.includes(detail.eventCode))
        .map((detail) => ({
          eventCode: [detail.eventCode],
          rowaction: "delete",
          contactdetail_id: detail.contactdetail_id,
        }));

      contact_data.push(...deselectedGroups);
    }

    const requestData = {
      master_data,
      contact_data,
    };

    try {
      let response;

      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update-contactData?contact_Id=${newAccoid}`;
        response = await axios.put(updateApiUrl, requestData);
        toast.success("Data updated successfully!");
      } else {
        response = await axios.post(
          `${API_URL}/insert-contactData`,
          requestData
        );
        toast.success("Data saved successfully!");
      }

      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setIsEditing(false);
      setIsLoading(false);

      window.location.reload();
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(`Error occurred while saving data: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
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

        newAccoid = data.contact_Id;

        newDetailId =
          detailData.length > 0 && detailData[0].contactdetail_id
            ? detailData[0].contactdetail_id
            : null;
        console.log(data);

        setFormData({
          ...formData,
          ...data,
        });

        setAccountData(data || {});
        setAccountDetail(detailData || []);

        console.log("Account Detail", detailData);

        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);
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
        toast.error("Deletion cancelled");
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
    try {
      const response = await axios.get(
        `${API_URL}/getcontactDataByid?contact_Id=${selectedRecord.contact_Id}`
      );
      const data = response.data.account_master_data;
      const detailData = response.data.account_detail_data || [];

      newAccoid = data.contact_Id;

      newDetailId =
        detailData.length > 0 && detailData[0].contactdetail_id
          ? detailData[0].contactdetail_id
          : null;
      console.log(data);

      setFormData({
        ...formData,
        ...data,
      });

      setAccountData(data || {});
      setAccountDetail(detailData || []);

      console.log("Account Detail", detailData);

      const eventCodes = detailData
        .map((detail) => detail.eventCode)
        .filter((eventCode) => eventCode !== null && eventCode !== undefined);

      setSelectedGroups(eventCodes || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setUpdateButtonClicked(true);
    setIsEditing(false);
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
        }));

        setAccountData(accountMasterData || {});
        setAccountDetail(detailData || []);

        // Map event codes from detail data (filtering out any null/undefined eventCode values)
        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);
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
        }));

        setAccountData(accountMasterData || {});
        setAccountDetail(detailData || []);

        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);
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
        }));

        setAccountData(accountMasterData || {});
        setAccountDetail(detailData || []);

        // Map event codes from detail data (filtering out any null/undefined eventCode values)
        const eventCodes = detailData
          .map((detail) => detail.eventCode)
          .filter((eventCode) => eventCode !== null && eventCode !== undefined);

        setSelectedGroups(eventCodes || []);
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
      const response = await axios.get(
        `${API_URL}/getcontactDataByid?contact_Id=${id}`
      );
      const data = response.data.account_master_data;
      const detailData = response.data.account_detail_data || [];
      newAccoid = response.data.account_master_data.contact_Id

      setFormData((prev) => ({
        ...prev,
        ...data,
      }));

      setAccountData(data || {});
      setAccountDetail(detailData || []);

      const eventCodes = detailData
        .map((detail) => detail.eventCode)
        .filter((eventCode) => eventCode !== null && eventCode !== undefined);

      setSelectedGroups((prev) => [...new Set([...prev, ...eventCodes])]);
    };

    const fetchAllContactData = async () => {
      setIsLoading(true);
      try {
        for (const id of contactIdsToUse) {
          await fetchContactData(id);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setIsLoading(false);
      }
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setUpdateButtonClicked(true);
      setIsEditing(false);
    };

    if (contactIdsToUse && contactIdsToUse.length > 0) {
      fetchAllContactData();
    }
  }, [contactIdsToUse]);

  
  return (
    <>
      <ToastContainer />
      {/* <button className="eTenderButton" onClick={handleEtender}>eTender</button> */}
      <div>
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
            <label htmlFor="anniversary">Annivesray:</label>
            <input
              type="date"
              id="anniversary"
              name="anniversary"
              value={formData.anniversary}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
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
              value={formData.DOB}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
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
