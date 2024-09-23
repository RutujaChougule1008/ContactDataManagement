import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import Pagination from "../../../common/Pagination";
import SearchBar from "../../../common/SearchBar";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const SearchPageUtility = () => {
  const [contactData, setContactData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  const { eventCodes, eventNames } = location.state;

  // Function to fetch contact data from the API
  const fetchContactData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/contact_data`, {
        params: {
          'eventCode': eventCodes,
          
        },
        paramsSerializer: (params) => new URLSearchParams(params).toString(),
      });

      setContactData(response.data); 
      setFilteredData(response.data); 
      setLoading(false);
    } catch (err) {
      setError('Error fetching data');
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
    const filtered = contactData.filter(post => {
      const searchTermLower = searchTerm.toLowerCase();
      return Object.keys(post).some(key => {
        const value = post[key];
        return value !== null && value !== undefined && String(value).toLowerCase().includes(searchTermLower);
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

  const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom textAlign="center">
      {eventNames && eventNames.length > 0 ? `Report for: ${eventNames.join(', ')}` : 'Contact Data Search'}
      </Typography>

      {loading && <Typography variant="h6" gutterBottom textAlign="center">Loading...</Typography>}
      {error && <Typography variant="h6" gutterBottom textAlign="center" style={{ color: 'red' }}>{error}</Typography>}

      {/* Search Bar */}
      <Grid container spacing={2} alignItems="center" justifyContent="flex-end" sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={4}>
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} />
        </Grid>
      </Grid>

      {/* Contact Data Table */}
      {!loading && (
        <>
          <TableContainer component={Paper} sx={{ marginTop: 2, maxHeight: '70vh', maxWidth: '100%', width: '80vw' }}>
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
