import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchBar from "../../../common/SearchBar";
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Grid,
  Typography,
  Box,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

const OrganizationNameSearchPage = () => {
  const [orgData, setOrgData] = useState([]);
  const [filteredOrgData, setFilteredOrgData] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [selectedOrgNames, setSelectedOrgNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventDates, setEventDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allData, setAllData] = useState([]); // Store full contact details
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizationNames();
    fetchEventDates();
  }, []);

  // API call to fetch organization names
  const fetchOrganizationNames = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-organization-names`
      );

      if (Array.isArray(response.data.organization_names)) {
        setOrgData(response.data.organization_names);
        setFilteredOrgData(response.data.organization_names);
      } else {
        console.error("API response is not an array:", response.data);
        setOrgData([]);
        setFilteredOrgData([]);
      }
    } catch (error) {
      console.error("Error fetching organization names:", error);
    }
  };

  // API call to fetch contact data and events
  const fetchEventDates = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/get-contactData`;
      const response = await axios.get(apiUrl);
      if (response.data && response.data.all_data) {
        setAllData(response.data.all_data);

        // Extract event dates from all_data (assuming they have DOB or anniversary)
        const dates = response.data.all_data
          .filter(contact => contact.DOB || contact.anniversary)
          .flatMap(contact => {
            const events = [];
            if (contact.DOB) events.push({ date: new Date(contact.DOB), name: contact.org_name, type: "Birthday" });
            if (contact.anniversary) events.push({ date: new Date(contact.anniversary), name: contact.org_name, type: "Anniversary" });
            return events;
          });
        setEventDates(dates);
      }
    } catch (error) {
      console.error("Error fetching event dates:", error);
      setEventDates([]);
    }
  };

  // Handle checkbox change for organization selection
  const handleCheckboxChange = (e, org) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedOrgs((prev) => [...prev, org]);
      setSelectedOrgNames((prevNames) => [...prevNames, org]);
    } else {
      setSelectedOrgs((prev) => prev.filter((name) => name !== org));
      setSelectedOrgNames((prevNames) =>
        prevNames.filter((name) => name !== org)
      );
    }
  };

  // Handle Show button click to navigate to another page with selected organizations
  const handleShowClick = () => {
    navigate("/contact-data-org", {
      state: { orgNames: selectedOrgs, selectedOrgNames },
    });
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter orgData based on search term
  useEffect(() => {
    const filtered = orgData.filter((org) =>
      org && typeof org === 'string' && org.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrgData(filtered);
  }, [searchTerm, orgData]);

  // Render day contents with tooltip for event dates
  const renderDayContents = (day, date) => {
    const matchingEvents = eventDates.filter(event =>
      event.date.toDateString() === date.toDateString()
    );

    if (matchingEvents.length > 0) {
      const tooltipTitle = matchingEvents.map(event => `${event.name} (${event.type})`).join(", ");

      return (
        <Tooltip title={tooltipTitle} placement="top">
          <span>{day}</span>
        </Tooltip>
      );
    }

    return <span>{day}</span>;
  };

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: 2,
      marginLeft: "250px", // Adjust this to match your sidebar width
      transition: "margin-left 0.3s ease",
      marginTop:'15vh'
    }}>
      <Grid container spacing={2} justifyContent="center">
        <Typography variant="h6" gutterBottom textAlign="center" sx={{ marginBottom: 0.5 }}>
          Organization Name Search
        </Typography>

        {/* Search bar */}
        <Grid container justifyContent="center" sx={{ marginBottom: 1 }}>
          <Grid item xs={12} sm={6}>
            <SearchBar value={searchTerm} onChange={handleSearchChange} />
          </Grid>
        </Grid>

        {/* Organization table */}
        <table className="custom-table1">
          <thead>
            <tr>
              <th>Organization Name</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgData.length > 0 ? (
              filteredOrgData.map(
                (org, index) =>
                  org && (
                    <tr key={index}>
                      <td>{org}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrgs.includes(org)}
                          onChange={(e) => handleCheckboxChange(e, org)}
                        />
                      </td>
                    </tr>
                  )
              )
            ) : (
              <tr>
                <td colSpan="2">No organization data available.</td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          className="show-button"
          onClick={handleShowClick}
          disabled={selectedOrgs.length === 0} 
        >
          Show
        </button>

        {/* Calendar with events */}
        <Grid item xs={12} md={4} sx={{
  }}>
          <ReactDatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            highlightDates={eventDates.map(event => event.date)}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            renderDayContents={renderDayContents}
            inline
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationNameSearchPage;
