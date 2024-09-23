import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css'

const SearchPage = () => {
    const [groupData, setGroupData] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedGroupDetails, setSelectedGroupDetails] = useState(null); 
    const [selectedGroupNames, setSelectedGroupNames] = useState([]);
    const navigate = useNavigate(); 

    // API call to fetch details for a specific group when "Show" is clicked
    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/event_groups`, {
            });
            setSelectedGroupDetails(response.data);
            setGroupData(response.data)
        } catch (error) {
            console.error('Error fetching event group details:', error);
        }
    };

    useEffect(() => {

        fetchGroupDetails();
    }, []);


    const handleCheckboxChange = (e, group) => {
        const { checked } = e.target;
        const { eventCode, eventName } = group;
        if (checked) {
            setSelectedGroups((prev) => [...prev, group.eventCode]);
            setSelectedGroupNames((prevNames) => [...prevNames, eventName]);
        } else {
            setSelectedGroups((prev) => prev.filter((code) => code !== group.eventCode));
            setSelectedGroupNames((prevNames) => prevNames.filter((name) => name !== eventName));
        }
    };

    const handleShowClick = () => {
        // Redirect to the ContactData component with eventCodes as state
        navigate('/contact-data-event-code', {
            state: { eventCodes: selectedGroups, eventNames: selectedGroupNames} 
        });
    };


    return (
        <div className="contact-data-seach-form-table">
             
            <table className="custom-table1">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Event Group Name</th>
                        <th>Select</th>
                    </tr>
                </thead>
                <tbody>
                    {groupData.map((group) => (
                        <tr key={group.eventCode}>
                            <td>{group.eventCode}</td>
                            <td>{group.eventName}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedGroups.includes(group.eventCode)}
                                    onChange={(e) => handleCheckboxChange(e, group)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                    className="show-button"
                    onClick={handleShowClick}
                    disabled={selectedGroups.length === 0}
                >
                    Show
                </button>

            {/* Display the selected group details if available */}
            {selectedGroupDetails && (
                <div className="group-details">
                    <h4>{selectedGroupDetails.eventName}</h4>
                    <p>{selectedGroupDetails.eventCode}</p>
                    {/* Add more fields based on your API response */}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
