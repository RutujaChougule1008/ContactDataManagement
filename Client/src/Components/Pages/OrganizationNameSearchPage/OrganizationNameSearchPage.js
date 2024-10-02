import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../SearchPage/SearchPage.css";

const OrganizationNameSearchPage = () => {
  const [orgData, setOrgData] = useState([]); // Initialize orgData as an empty array
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [selectedOrgNames, setSelectedOrgNames] = useState([]);
  const navigate = useNavigate();

  // API call to fetch organization names
  const fetchOrganizationNames = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-organization-names`
      );

      // Ensure response.data.organization_names is an array before setting it to orgData
      if (Array.isArray(response.data.organization_names)) {
        setOrgData(response.data.organization_names);
      } else {
        console.error("API response is not an array:", response.data);
        setOrgData([]); // Set to an empty array in case of unexpected response
      }
    } catch (error) {
      console.error("Error fetching organization names:", error);
    }
  };

  useEffect(() => {
    fetchOrganizationNames();
  }, []);

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

  return (
    <div className="contact-data-search-form-table">
      <table className="custom-table1">
        <thead>
          <tr>
            <th>Organization Name</th>
            <th>Select</th>
          </tr>
        </thead>
        <tbody>
          {orgData.length > 0 ? (
            orgData.map(
              (org, index) =>
                // Ensure the organization name is valid before rendering
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
    </div>
  );
};

export default OrganizationNameSearchPage;
