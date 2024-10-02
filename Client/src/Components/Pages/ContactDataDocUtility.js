import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Pagination from "../../common/Pagination";
import SearchBar from "../../common/SearchBar";
import PerPageSelect from "../../common/PerPageSelect";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import ContactDataDoc from "./ContactDataDoc";
import { useContacts } from "./ContactContext";

const API_URL = process.env.REACT_APP_API_URL;

function ContactDataDocUtility() {
  const userRole = sessionStorage.getItem("user_type");
  const isViewer = userRole === "V";

  const [fetchedData, setFetchedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedContacts, setSelectedContacts } = useContacts();
  const [duplicates, setDuplicates] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showContactDataPopUp, setShowContactDataPopUp] = useState(false);
  const [contactData, setContactData] = useState({}); // Store fetched contact data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${API_URL}/get-contactData`;
        const response = await axios.get(apiUrl);
        if (response.data && response.data.all_data) {
          setFetchedData(response.data.all_data);
          setFilteredData(response.data.all_data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = fetchedData.filter((post) => {
      const searchTermLower = searchTerm.toLowerCase();
      return Object.keys(post).some((key) => {
        const value = post[key];
        return (
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(searchTermLower)
        );
      });
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, fetchedData]);

  useEffect(() => {
    const duplicateMap = {};
    fetchedData.forEach((contact) => {
      const key = `${contact.org_name}-${contact.org_holder_name}`;
      if (duplicateMap[key]) {
        duplicateMap[key].push(contact);
      } else {
        duplicateMap[key] = [contact];
      }
    });

    const duplicateGroups = Object.values(duplicateMap).filter(
      (group) => group.length > 1
    );

    // Flatten the duplicates and store them
    setDuplicates(duplicateGroups.flat());
  }, [fetchedData]);

  const handlePerPageChange = (event) => {
    setPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    localStorage.setItem("contactSearchTerm", event.target.value);
  };

  const pageCount = Math.ceil(filteredData.length / perPage);
  const paginatedPosts = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowClick = (contact_Id) => {
    const selectedRecord = filteredData.find(
      (record) => record.contact_Id === contact_Id
    );
    navigate("/contactData", { state: { selectedRecord } });
  };

  const handleBack = () => {
    localStorage.removeItem("contactSearchTerm");
    navigate("/home");
  };

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts((prevSelected) => {
      const newSelected = prevSelected.includes(contactId)
        ? prevSelected.filter((id) => id !== contactId)
        : [...prevSelected, contactId];

      console.log("Updated Selected Contacts:", newSelected);
      return newSelected;
    });
  };

  const fetchContactData = async (contactId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/getcontactDataByid?contact_Id=${contactId}`
      );
      return data; // Return the fetched data for the contact
    } catch (error) {
      console.error("Error fetching contact data:", error);
      return null; // Return null in case of error
    }
  };

  const handleMergeContacts = async () => {
    if (selectedContacts.length !== 2) {
      alert("Please select exactly two contacts to merge.");
      return;
    }

    setShowContactDataPopUp(true);

    // Fetch data for both contacts
    const firstContactData = await fetchContactData(selectedContacts[0]);
    const secondContactData = await fetchContactData(selectedContacts[1]);

    setContactData({
      first: firstContactData,
      second: secondContactData,
    });
    setSearchTerm("");
  };

  const handleClosePopup = () => {
    setShowContactDataPopUp(false);
  };

  useEffect(() => {
    const savedSearchTerm = localStorage.getItem("contactSearchTerm");
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
    }
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "3500px",
        margin: "auto",
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <ToastContainer />
      <Typography variant="h4" gutterBottom textAlign="center">
        Contact Data
      </Typography>

      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/contactData")}
            disabled={isViewer}
          >
            Add
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Back
          </Button>
        </Grid>
        <Grid item>
          <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} />
        </Grid>

        {selectedContacts.length === 2 && (
          <Grid container spacing={2} item xs={12} sm={4}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMergeContacts}
              >
                View Contact
              </Button>
            </Grid>

            {showContactDataPopUp && (
              <div className="city-master-modal">
                {contactData.first && (
                  <div className="city-master-modal-content">
                    <button
                      className="city-master-close-btn"
                      onClick={handleClosePopup}
                    >
                      &times;
                    </button>
                    <div className="city-master-popup-wrapper">
                      <ContactDataDoc
                        ContactIds={[selectedContacts[0]]}
                        closePopup={handleClosePopup}
                      />
                    </div>
                  </div>
                )}
                {contactData.second && (
                  <div className="city-master-modal-content">
                    <button
                      className="city-master-close-btn"
                      onClick={handleClosePopup}
                    >
                      &times;
                    </button>
                    <div className="city-master-popup-wrapper">
                      <ContactDataDoc
                        ContactIds={[selectedContacts[1]]}
                        closePopup={handleClosePopup}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Grid>
        )}
      </Grid>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: 2,
          maxHeight: "70vh",
          maxWidth: "3000px",
          width: "180vh",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Organization Name</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>City Name</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Mobile No</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Website URL</TableCell>
              <TableCell>Anniversary</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.map((post) => {
              // Check for duplicates in filteredData based on org_name and org_holder_name
              const isDuplicate =
                filteredData.filter(
                  (item) =>
                    item.org_name === post.org_name &&
                    item.org_holder_name === post.org_holder_name
                ).length > 1; // Check if there is more than one record

              const isSelected = selectedContacts.includes(post.contact_Id);

              // Show checkbox only if there is a duplicate
              const showCheckbox = isDuplicate;

              return (
                <TableRow
                  key={post.contact_Id}
                  style={{ cursor: "pointer" }}
                  onDoubleClick={() => handleRowClick(post.contact_Id)}
                >
                  <TableCell>
                    {showCheckbox && (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(post.contact_Id)}
                      />
                    )}
                  </TableCell>
                  <TableCell>{post.org_name || ""}</TableCell>
                  <TableCell>{post.org_holder_name || ""}</TableCell>
                  <TableCell>{post.designation || ""}</TableCell>
                  <TableCell>{post.city || ""}</TableCell>
                  <TableCell>{post.state || ""}</TableCell>
                  <TableCell>{post.country || ""}</TableCell>
                  <TableCell>{post.mobile_no || ""}</TableCell>
                  <TableCell>{post.email || ""}</TableCell>
                  <TableCell>{post.website || ""}</TableCell>
                  <TableCell>{post.anniversary || ""}</TableCell>
                  <TableCell>{post.DOB || ""}</TableCell>
                  <TableCell>{post.eventCodeCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container justifyContent="center" sx={{ marginTop: 3 }}>
        <Pagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </Grid>
    </div>
  );
}

export default ContactDataDocUtility;
