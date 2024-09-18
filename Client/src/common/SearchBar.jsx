import React from "react";

function SearchBar({ value, onChange, onSearchClick }) {
  return (
    <div className="controls">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          id="search"
          placeholder="Search by Title"
          value={value}
          onChange={onChange}
        />
        <div className="input-group-append">
        
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
