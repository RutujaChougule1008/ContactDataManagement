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
    Typography,
    useTheme,
    useMediaQuery
} from "@mui/material";
import Pagination from "../../common/Pagination";
import SearchBar from "../../common/SearchBar";
import PerPageSelect from "../../common/PerPageSelect";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function ContactDataDocUtility() {
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        const filtered = fetchedData.filter(post => {
            const searchTermLower = searchTerm.toLowerCase();
            return Object.keys(post).some(key => {
                const value = post[key];
                return value !== null && value !== undefined && String(value).toLowerCase().includes(searchTermLower);
            });
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
    };

    const pageCount = Math.ceil(filteredData.length / perPage);

    const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClick = () => {
        navigate("/contactData");
    };

    const handleRowClick = (contact_Id) => {
        const selectedRecord = filteredData.find(record => record.contact_Id === contact_Id);
        navigate("/contactData", { state: { selectedRecord } });
    };

    const handleBack = () => {
        navigate("/home");
    };

    return (
        <div style={{ padding: '20px', maxWidth: '3500px', margin: 'auto', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <Typography variant="h4" gutterBottom textAlign="center">
                Contact Data
            </Typography>

            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleClick}>
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
                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ marginTop: 2, maxHeight: '70vh', maxWidth: '3000px', width: '180vh' }}>
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
                        {paginatedPosts.map((post) => (
                            <TableRow
                                key={post.contact_Id}
                                style={{ cursor: "pointer" }}
                                onDoubleClick={() => handleRowClick(post.contact_Id)}
                            >
                                <TableCell>{post.org_name || ""}</TableCell>
                                <TableCell>{post.org_holder_name || ""}</TableCell>
                                <TableCell>{post.designation || ""}</TableCell>
                               
                                <TableCell>{post.city || ""}</TableCell>
                                <TableCell>{post.state || ""}</TableCell>
                                <TableCell>{post.country || ""}</TableCell>
                                
                                <TableCell>{post.mobile_no || ""}</TableCell>
                                <TableCell>{post.email || ""}</TableCell>
                                
                                <TableCell>{post.website || ""}</TableCell>
                               
                                
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
        </div>
    );
}

export default ContactDataDocUtility;
