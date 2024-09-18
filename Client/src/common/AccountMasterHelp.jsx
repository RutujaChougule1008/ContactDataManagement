import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import DataTableSearch from "../common/DataTableSearch";
import DataTablePagination from "../common/DataTablePagination";
import axios from "axios";
import "../App.css";

var lActiveInputFeild = "";
var mc = '';
var label = ''

const ApiDataTableModal = ({ onAcCodeClick, acType, name, companyCode, millData, mc, label, millcode, newMillCode, CategoryName, disabledFeild }) => {

  const [showModal, setShowModal] = useState(false);
  const [popupContent, setPopupContent] = useState([]);
  const [enteredAcCode, setEnteredAcCode] = useState("");
  const [enteredAcName, setEnteredAcName] = useState("");
  const [enteredAccoid, setEnteredAccoid] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [apiDataFetched, setApiDataFetched] = useState(false);
  label = enteredAcName

  
// Fetch data based on acType
const fetchAndOpenPopup = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/task-master/system_master_help`);
    const data = response.data;
    setPopupContent(data);
    setShowModal(true);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAndOpenPopup();
        setShowModal(false);
        setApiDataFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (!apiDataFetched) {
      fetchData();
    }

  }, [apiDataFetched]);

  // Handle Mill Code button click
  const handleMillCodeButtonClick = (acData) => {
    lActiveInputFeild = name;
    fetchAndOpenPopup();
    if (onAcCodeClick) {
      onAcCodeClick({ enteredAcCode, mc, enteredAcName });
    }
  };

  //popup functionality show and hide
  const handleCloseModal = () => {
    setShowModal(false);
  };

  //handle onChange event for Mill Code,Broker Code and Bp Account
  const handleAcCodeChange = async (event) => {
    const { value } = event.target;
    setEnteredAcCode(value);
    setEnteredAcName(""); // Reset Ac_Name while the data is being fetched

    try {
      // Assuming `apiURL` is defined somewhere in your code
      const response = await axios.get(`http://localhost:8080/api/task-master/system_master_help`);
      const data = response.data;
      setPopupContent(data);
      setApiDataFetched(true);

      const matchingItem = data.find((item) => item.Category_Code === parseInt(value, 10));

      if (matchingItem) {
        setEnteredAcName(matchingItem.Category_Name);
        setEnteredAccoid(matchingItem.accoid);
        mc = matchingItem.accoid;
        label = matchingItem.enteredAcName;

        if (onAcCodeClick) {
          onAcCodeClick(matchingItem.Category_Code, mc, matchingItem.Category_Name, value);
        }
      } else {
        setEnteredAcName("");
        setEnteredAccoid("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //After open popup onDoubleClick event that record display on the feilds
  const handleRecordDoubleClick = (item) => {
    if (lActiveInputFeild === name) {
      setEnteredAcCode(item.Category_Code);
      mc = item.accoid
      label = item.enteredAcName
      setEnteredAcName(item.Category_Name);

      if (onAcCodeClick) {
        onAcCodeClick(item.Category_Code, mc, enteredAcName, enteredAcCode);
      }
    }

    setShowModal(false);
  };

  //handle pagination number
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  //handle search functionality
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const filteredData = popupContent.filter((item) =>
    item.Category_Name && item.Category_Name.toLowerCase().includes(searchTerm.toLowerCase())

  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredData.slice(startIndex, endIndex);

  // Handle key events
  useEffect(() => {
    const handleKeyEvents = async (event) => {
      if (event.key === "F1") {
        if (event.target.id === name) {
          lActiveInputFeild = name
          fetchAndOpenPopup();
          event.preventDefault();
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedRowIndex((prev) =>
          Math.min(prev + 1, itemsToDisplay.length - 1)
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        // Check if a row is selected
        if (selectedRowIndex >= 0) {
          handleRecordDoubleClick(itemsToDisplay[selectedRowIndex]);
        }
        setSelectedRowIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyEvents);

    return () => {
      window.removeEventListener("keydown", handleKeyEvents);
    };
  }, [selectedRowIndex, itemsToDisplay, acType, name, fetchAndOpenPopup, handleRecordDoubleClick]);


  return (
    <div className="d-flex flex-row ">
      <div className="d-flex ">
        <div className="d-flex">
          <input
            tabIndex="5"
            type="text"
            className="form-control ms-2"
            id={name}
            autoComplete="off"
            value={enteredAcCode !== '' ? enteredAcCode : newMillCode}
            onChange={handleAcCodeChange}
            style={{ width: "150px", height: "35px" }}
            disabled={disabledFeild}

          />
          <Button
            tabIndex="6"
            variant="primary"
            onClick={handleMillCodeButtonClick}
            className="ms-1"
            style={{ width: "30px", height: "35px" }}
            disabled={disabledFeild}
          >
            ...
          </Button>
          <label id="acNameLabel" className=" form-labels ms-2">
            {enteredAcName || CategoryName}
          </label>
        </div>
      </div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        dialogClassName="modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>Popup</Modal.Title>
        </Modal.Header>
        <DataTableSearch data={popupContent} onSearch={handleSearch} />
        <Modal.Body>
          {Array.isArray(popupContent) ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category_Code</th>
                    <th>Category_Name</th>

                  </tr>
                </thead>
                <tbody>
                  {itemsToDisplay.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        selectedRowIndex === index ? "selected-row" : ""
                      }
                      onDoubleClick={() => handleRecordDoubleClick(item)}
                    >
                      <td>{item.Category_Code}</td>
                      <td>{item.Category_Name}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            "Loading..."
          )}
        </Modal.Body>

        <Modal.Footer>
          <DataTablePagination
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApiDataTableModal;