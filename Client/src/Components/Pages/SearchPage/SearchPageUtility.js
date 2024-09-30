import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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

const SearchPageUtility = () => {
  const [contactData, setContactData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  const { eventCodes, eventNames } = location.state;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to fetch contact data from the API
  const fetchContactData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/contact_data`, {
        params: {
          eventCode: eventCodes,
        },
        paramsSerializer: (params) => new URLSearchParams(params).toString(),
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
    if (eventCodes && eventCodes.length > 0) {
      fetchContactData();
    }
  }, [eventCodes]);

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
    const sanitizedEventNames =
      eventNames && eventNames.length > 0
        ? eventNames.join("_").replace(/[\/:*?"<>|]/g, "")
        : "Contact_Data_Search";

    XLSX.writeFile(workbook, `${sanitizedEventNames}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Organization Name",
      "Owner Name",
      "Designation",
      "City",
      "State",
      "Country",
      "Mobile No",
      "Email",
      "Website",
      "Anniversary",
      "DOB",
    ];

    const tableRows = filteredData.map((data) => [
      data.org_name || "",
      data.org_holder_name || "",
      data.designation || "",
      data.city || "",
      data.state || "",
      data.country || "",
      data.mobile_no || "",
      data.email || "",
      data.website || "",
      data.anniversary || "",
      data.DOB || "",
    ]);

    doc.text(
      eventNames && eventNames.length > 0
        ? `Report for: ${eventNames.join(", ")}`
        : "Contact Data Search",
      14,
      10
    );

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      margin: { top: 20, bottom: 10, left: 10, right: 10 },
      styles: { fontSize: 8, overflow: "linebreak", cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 },
        7: { cellWidth: 35 },
        8: { cellWidth: 35 },
        9: { cellWidth: 25 },
        10: { cellWidth: 25 },
      },
      didDrawPage: function (data) {
        doc.text(
          `Page ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save(
      eventNames && eventNames.length > 0
        ? `Report for: ${eventNames.join(", ")}`
        : "Contact Data Search.pdf"
    );
  };
  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        {eventNames && eventNames.length > 0
          ? `Report for: ${eventNames.join(", ")}`
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
        <Button variant="contained" onClick={handleClick}>
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
                  <TableRow key={data.contact_Id} style={{ cursor: "pointer" }}>
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

export default SearchPageUtility;
