function PinModal({ pin, onClose, onDelete }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{pin.title || "Untitled Pin"}</h2>

        {pin.description && <p>{pin.description}</p>}

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>

          <button className="delete-button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default PinModal;
