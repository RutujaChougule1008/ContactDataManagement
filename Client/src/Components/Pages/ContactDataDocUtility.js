import React, { useState, useEffect } from "react";
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
  Box,
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
  const [duplicates, setDuplicates] = useState({});
  const navigate = useNavigate();
  const [tableHeight, setTableHeight] = useState("calc(100vh - 350px)");

  const [showContactDataPopUp, setShowContactDataPopUp] = useState(false);
  const [contactData, setContactData] = useState({ first: null, second: null });

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
    const handleResize = () => {
      const availableHeight = window.innerHeight - 350; // Adjust for header, footer, and padding
      setTableHeight(`${availableHeight}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const mobileNumberMap = {};
    fetchedData.forEach((contact) => {
      const mobileNumber = contact.mobile_no;
      if (mobileNumber) {
        if (mobileNumberMap[mobileNumber]) {
          mobileNumberMap[mobileNumber].push(contact);
        } else {
          mobileNumberMap[mobileNumber] = [contact];
        }
      }
    });

    const duplicateContacts = Object.values(mobileNumberMap).filter(
      (group) => group.length > 1
    );

    const duplicateMap = duplicateContacts.reduce((acc, group) => {
      group.forEach((contact) => {
        acc[contact.contact_Id] = true;
      });
      return acc;
    }, {});

    setDuplicates(duplicateMap);
  }, [fetchedData]);

  useEffect(() => {
    let filtered = fetchedData.filter((post) => {
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

    filtered = filtered.sort((a, b) => {
      if (a.mobile_no < b.mobile_no) return -1;
      if (a.mobile_no > b.mobile_no) return 1;
      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, fetchedData]);

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

      return newSelected;
    });
  };

  const fetchContactData = async (contactId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/getcontactDataByid?contact_Id=${contactId}`
      );
      return data;
    } catch (error) {
      console.error("Error fetching contact data:", error);
      return null;
    }
  };

  const handleMergeContacts = async () => {
    if (selectedContacts.length !== 2) {
      alert("Please select exactly two contacts to merge.");
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/merge-contacts`, null, {
        params: {
          first_contact_Id: selectedContacts[0],
          second_contact_Id: selectedContacts[1],
        },
      });

      if (response.status === 200) {
        toast.success("Contacts merged successfully!");
        setSelectedContacts([]);
        const updatedData = await axios.get(`${API_URL}/get-contactData`);
        setFetchedData(updatedData.data.all_data);
        setFilteredData(updatedData.data.all_data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error merging contacts:", error);
      toast.error("Failed to merge contacts. Please try again.");
    }
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
    <Box
    sx={{
      padding: "10px",
      margin: "auto",
      backgroundColor: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      maxWidth:"95%",
      overflow: "auto",
      marginLeft:"22vh"
    }}
    >
      <ToastContainer />
      <Typography variant="h4" gutterBottom textAlign="center">
        Contact Data
      </Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
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
  <Button
    variant="contained"
    color="error"
    onClick={handleMergeContacts}
    disabled={selectedContacts.length !== 2 || !selectedContacts.every(contactId => duplicates[contactId])}
  >
    Merge Selected Contacts
  </Button>
</Grid>
        <Grid item>
          <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} />
        </Grid>
      </Grid>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: 2,
          maxHeight: tableHeight,
          overflowY: "auto",
        }}
      >
        <Table stickyHeader>
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
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.map((post) => {
              const isDuplicate = !!duplicates[post.contact_Id];
              const isSelected = selectedContacts.includes(post.contact_Id);

              return (
                <TableRow
                  key={post.contact_Id}
                  style={{ cursor: "pointer" }}
                  onDoubleClick={() => handleRowClick(post.contact_Id)}
                >
                  <TableCell>
                    {isDuplicate && (
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
                  <TableCell>{isDuplicate ? "Duplicate" : "Unique"}</TableCell>
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
    </Box>
  );
}

export default ContactDataDocUtility;
