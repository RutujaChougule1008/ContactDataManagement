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
  Grid,
  Paper,
} from "@mui/material";
import Pagination from "../../../common/Pagination";
import SearchBar from "../../../common/SearchBar";
import PerPageSelect from "../../../common/PerPageSelect";
import axios from "axios";
import "./EventGroupUtility.css";

const API_URL = process.env.REACT_APP_API_URL;

function EventGroupUtility() {
  const userRole = sessionStorage.getItem("user_type");
  const isViewer = userRole === "V";

  const [eventGroups, setEventGroups] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/get-event_groups_by_count`
        );
        setEventGroups(response.data.event_group_data);
        setFilteredData(response.data.event_group_data);
      } catch (error) {
        console.error("Error fetching event groups:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = eventGroups.filter((group) => {
      return group.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, eventGroups]);

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

  const handleRowClick = (eventCode) => {
    const selectedRecord = eventGroups.find(
      (record) => record.eventCode === eventCode
    );
    navigate("/event-group-master", { state: { selectedRecord } });
  };

  const handleAddNew = () => {
    navigate("/event-group-master");
  };

  return (
    <div className="container" style={{ height: "980px" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleAddNew}
            disabled={isViewer}
          >
            Add New
          </Button>
        </Grid>
        <Grid item xs={6}>
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} />
        </Grid>
        <Grid item xs={6}>
          <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3}>
            <TableContainer className="tableContainer">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPosts.map((group) => (
                    <TableRow
                      key={group.eventCode}
                      onClick={() => handleRowClick(group.eventCode)}
                      className="tableRow"
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell>{group.eventCode}</TableCell>
                      <TableCell>{group.eventName}</TableCell>
                      <TableCell>{group.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Pagination
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default EventGroupUtility;
