import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import Pagination from "../../../common/Pagination";
import SearchBar from "../../../common/SearchBar";
import axios from "axios";
import PerPageSelect from "../../../common/PerPageSelect";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL;

const OrganizationNameSearchPageUtility = () => {
  const userRole = sessionStorage.getItem("user_type");
  const isViewer = userRole === "V";
  const [contactData, setContactData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  // Get selected organization names from location state
  const { orgNames, selectedOrgNames } = location.state || {};

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fetch contact data by organization names
  const fetchContactData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/contact_data_by_orgname`, {
        params: {
          org_names: selectedOrgNames.join(","),
        },
      });

      setContactData(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgNames && orgNames.length > 0) {
      fetchContactData();
    }
  }, [orgNames]);

  // Filter the data based on the search term
  useEffect(() => {
    const filtered = contactData.filter((post) => {
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
  }, [searchTerm, contactData]);

  const handlePerPageChange = (event) => {
    setPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const pageCount = Math.ceil(filteredData.length / perPage);

  const paginatedPosts = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Data");
    const sanitizedOrgNames =
      selectedOrgNames && selectedOrgNames.length > 0
        ? selectedOrgNames.join("_").replace(/[\/:*?"<>|]/g, "")
        : "Contact_Data_Search";

    XLSX.writeFile(workbook, `${sanitizedOrgNames}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    // Sanitize the event names to remove special characters except spaces
    const sanitizedEventNames =
      selectedOrgNames && selectedOrgNames.length > 0
        ? selectedOrgNames.join(" ").replace(/[^\w\s]/g, "")
        : "Client Connect Report";

    const tableColumn = [
      "Organization Name",
      "Name",
      "Designation",
      "City",
      "State",
      "Country",
      "Mobile No",
      "Email",
    ];

    const tableRows = filteredData.map((data) => [
      data.org_name || "",
      data.org_holder_name || "",
      data.designation || "",
      data.city || "",
      data.state || "",
      data.country || "",
      formatMultipleValues(data.mobile_no) || "",
      formatMultipleValues(data.email) || "",
    ]);

    doc.setFontSize(12);
    const titleText = sanitizedEventNames;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - textWidth) / 2, 20); // Centering title

    // Add the table after the title with more space from the top
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25, // More space from the top
      margin: { top: 40, bottom: 10, left: 10, right: 10 },
      styles: { fontSize: 8, overflow: "linebreak", cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 35 },
        7: { cellWidth: 45 },
      },
      didDrawPage: function (data) {
        // Add small-sized page numbers
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Save the file with a sanitized title
    doc.save(sanitizedEventNames + ".pdf");
  };

  // Helper function to format multiple values in one cell (for mobile numbers or emails)
  const formatMultipleValues = (value) => {
    if (!value) return "";
    // Check if the value contains multiple entries (comma-separated or space-separated)
    const values = value.split(/[, ]+/);
    return values.join("\n"); // Join with a newline to place values one below another
  };

  const handleRowClick = (contact_Id) => {
    const selectedRecord = filteredData.find(
      (record) => record.contact_Id === contact_Id
    );
    navigate("/contactData", { state: { selectedRecord } });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        {selectedOrgNames && selectedOrgNames.length > 0
          ? `Report for: ${selectedOrgNames.join(", ")}`
          : "Contact Data Search"}
      </Typography>

      {loading && (
        <Typography variant="h6" gutterBottom textAlign="center">
          Loading...
        </Typography>
      )}
      {error && (
        <Typography
          variant="h6"
          gutterBottom
          textAlign="center"
          style={{ color: "red" }}
        >
          {error}
        </Typography>
      )}

      <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        <Button variant="contained" onClick={handleClick} disabled={isViewer}>
          Export To
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem
            onClick={() => {
              exportToExcel();
              handleClose();
            }}
          >
            Excel
          </MenuItem>
          <MenuItem
            onClick={() => {
              exportToPDF();
              handleClose();
            }}
          >
            PDF
          </MenuItem>
        </Menu>
      </Grid>

      {/* Search Bar */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ marginTop: 2 }}
      >
        <Grid item>
          <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} />
        </Grid>
      </Grid>

      {/* Contact Data Table */}
      {!loading && (
        <>
          <TableContainer
            component={Paper}
            sx={{
              marginTop: 2,
              maxHeight: "70vh",
              maxWidth: "100%",
              width: "90vw",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organization Name</TableCell>
                  <TableCell>Owner Name</TableCell>
                  <TableCell>Designation</TableCell>

                  <TableCell>City Name</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Country</TableCell>

                  <TableCell>Mobile No</TableCell>
                  <TableCell>Email</TableCell>

                  <TableCell>Website URL</TableCell>
                  <TableCell>Anniversaty</TableCell>
                  <TableCell>DOB</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPosts.map((data) => (
                  <TableRow
                    key={data.contact_Id}
                    style={{ cursor: "pointer" }}
                    onDoubleClick={() => handleRowClick(data.contact_Id)}
                  >
                    <TableCell>{data.org_name || ""}</TableCell>
                    <TableCell>{data.org_holder_name || ""}</TableCell>
                    <TableCell>{data.designation || ""}</TableCell>

                    <TableCell>{data.city || ""}</TableCell>
                    <TableCell>{data.state || ""}</TableCell>
                    <TableCell>{data.country || ""}</TableCell>

                    <TableCell>{data.mobile_no || ""}</TableCell>
                    <TableCell>{data.email || ""}</TableCell>

                    <TableCell>{data.website || ""}</TableCell>
                    <TableCell>{data.anniversary || ""}</TableCell>
                    <TableCell>{data.DOB || ""}</TableCell>
                  </TableRow>
                ))}
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
        </>
      )}
    </div>
  );
};

export default OrganizationNameSearchPageUtility;
