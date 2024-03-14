import React from "react";
import "../styles/Modal.css"; 

function ErrorModal({ error }) {
  if (!error) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        Error: {error.message}
        <br></br>
        <span className="fix">{error.fix}</span>
        <br></br>
        <span className="refresh">
          After fixing the error above, refresh the page
        </span>
      </div>
    </div>
  );
}

export default ErrorModal;
