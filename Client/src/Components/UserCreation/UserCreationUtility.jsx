import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";


function UserCreationUtility() {
  const apiURL = process.env.REACT_APP_API_URL

  const [fetchedData, setFetchedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
   
      try {
        const apiUrl = `${apiURL}/api/employees/getallusers`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        // console.log("data is",data)
        setFetchedData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = fetchedData.filter(post => {
      const searchTermLower = searchTerm.toLowerCase();
      const User_Name = (post.User_Name || '').toLowerCase();
      const Email = (post.Email || '').toLowerCase();

      return (
        (filterValue === "" || post.group_Type === filterValue) &&
        (User_Name.includes(searchTermLower) ||
        (Email.includes(searchTermLower)))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1); 
  }, [searchTerm, filterValue, fetchedData]);

  const handleSearchTermChange = (event) => {
    const term = event.target.value;
    
    setSearchTerm(term);
  };

  const pageCount = Math.ceil(filteredData.length / perPage);

  const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleClick = () => {
    navigate("/user_Creation");
  };
  
  const handleRowClick = (User_Code) => {
  const selectedEmployee = fetchedData.find((employee) => employee.User_Code === User_Code);
  navigate("/user_Creation", { state: { editRecordData: selectedEmployee } });
};



  const handleBackButton=()=>{
    navigate("/home")
  }

  return (
    <div className="container mt-4">
    <div className="row">
      <div className="col-md-6">
        <button className="btn btn-primary" onClick={handleClick}>
          Add
        </button>
        <button className="btn btn-secondary ms-2" onClick={handleBackButton}>
          Back
        </button>
      </div>


      <div className="col-md-4 d-flex justify-content-end">
  <div className="input-group">
    <input
      type="text"
      className="form-control rounded-pill"
      placeholder="Search By Employee Name..."
      value={searchTerm}
      onChange={handleSearchTermChange}
    />
    <div className="input-group-append">
      <button className="btn btn-outline-secondary rounded-pill" type="button">
        <FaSearch />
      </button>
    </div>
  </div>
</div>
</div>


    <br></br>
      
      <table className="table table-bordered table-striped">
  <thead className="thead-dark">
          <tr>
            <th>User Code</th>
            <th>User Name</th>
            <th>Mobile No</th>
            <th>Email Id</th>
            <th>User Type</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPosts.map((post) => (
            <tr
              key={post.User_Code}
              className="row-item"
              onDoubleClick={() => handleRowClick(post.User_Code)}
            >
              <td>{post.User_Code}</td>
              <td>{post.User_Name}</td>
              <td>{post.Mobile_No}</td>
              <td>{post.Email}</td>
              <td>{post.User_Type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: pageCount }).map((_, index) => (
            <li
              key={index}
              className={`page-item ${
                index + 1 === currentPage ? "active" : ""
              }`}
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
    </div>
  );
}

export default UserCreationUtility;
