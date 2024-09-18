import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { Card } from "react-bootstrap";
import "./Search.css";
import { useNavigate } from "react-router-dom";

function UserCreationUtility() {
    const apiURL = process.env.REACT_APP_API_URL;
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isSearchPerformed, setIsSearchPerformed] = useState(false);
    const [searchMessage, setSearchMessage] = useState("");
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = `${apiURL}/api/employees/getallFiles`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                setFetchedData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (isSearchPerformed) {
            const filtered = fetchedData.filter((post) => {
                const searchTermLower = searchTerm.toLowerCase();
                const userName = (post.File_Name || "").toLowerCase();
                const fileDescription = (post.File_Discription || "").toLowerCase();

                return (
                    (filterValue === "" || post.group_Type === filterValue) &&
                    (userName.includes(searchTermLower) ||
                        fileDescription.includes(searchTermLower))
                );
            });

            setFilteredData(filtered);
            setCurrentPage(1);
        }
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchTerm, filterValue, fetchedData, isSearchPerformed]);


    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (term === "") {
            setIsSearchPerformed(false);
            setFilteredData([]);
        }
    };

    const handleSearchButtonClick = () => {
        if (searchTerm.trim() === "") {
            setSearchMessage("Please type something to search.");
            setIsSearchPerformed(false);
            searchInputRef.current.focus()
            return;
        }
        setSearchMessage("");
        setIsSearchPerformed(true);

    };

    const pageCount = Math.ceil(filteredData.length / perPage);

    const paginatedPosts = filteredData.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleRowClick = (record) => {
        setSelectedRecord(record);
    };

    const handleClosePopup = () => {
        setSelectedRecord(null);
    };

    const handleBackButton = () => {
        navigate("/home");
    };

    return (
        <div className="container mt-4">
            <h3 className="mt-4 mb-4 text-center custom-heading">
                Search File
            </h3>
            <div className="row justify-content-center">
                <div className="col-md-6 d-flex justify-content-center">
                    <div className="input-group ">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search File..."
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            ref={searchInputRef}
                            style={{ height: "45px", borderRadius: "50px" }}
                        />
                        <div className="input-group-append">
                            <button
                                className="btn btn-outline-secondary ml-2"
                                type="button"
                                onClick={handleSearchButtonClick}
                                style={{ marginLeft: "8px", borderRadius: "50px", marginTop: "2px" }}
                            >
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 d-flex justify-content-center">
                    <button className="btn btn-primary" onClick={handleBackButton} style={{ marginLeft: "-95px" }}>
                        Back
                    </button>
                </div>
            </div>
            <br></br>

            {searchMessage && (
                <div className="alert alert-warning text-center" role="alert">
                    {searchMessage}
                </div>
            )}

            {isSearchPerformed && filteredData.length > 0 && (
                <>
                    <table className="table table-bordered table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th>Doc No</th>
                                <th>Doc Date</th>
                                <th>File Name</th>
                                <th>File Description</th>
                                <th>Cupboard Code</th>
                                <th>File No</th>
                                <th>Cupboard Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPosts.map((post) => (
                                <tr
                                    key={post.User_Code}
                                    className="row-item"
                                    onClick={() => handleRowClick(post)}
                                >
                                    <td>{post.Doc_No}</td>
                                    <td>{post.Doc_Date}</td>
                                    <td>{post.File_Name}</td>
                                    <td>{post.File_Discription}</td>
                                    <td>{post.Cupboard_Code}</td>
                                    <td>{post.File_No}</td>
                                    <td>{post.CupBoardCode_Name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: pageCount }).map((_, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </>
            )}

            {selectedRecord && (
                <Card className="popup-card">
                    <Card.Header>
                        <h5>File Details</h5>
                        <button className="close" onClick={handleClosePopup}>
                            &times;
                        </button>
                    </Card.Header>
                    <Card.Body>
                        <h5 style={{ color: "blue" }}>File No: {selectedRecord.File_No}</h5>
                        <h5 style={{ color: "blue" }}>File Name: {selectedRecord.File_Name}</h5>
                        <h5 style={{ color: "blue" }}>Cupboard Name: {selectedRecord.CupBoardCode_Name}</h5>
                    </Card.Body>
                </Card>
            )}

            {isSearchPerformed && filteredData.length === 0 && (
                <div className="alert alert-warning" role="alert">
                    No records found matching the search criteria.{
                        searchInputRef.current.focus()
                    }
                </div>
            )}
        </div>
    );
}

export default UserCreationUtility;
