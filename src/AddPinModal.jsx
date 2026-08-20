function AddPinModal({
  title,
  description,
  setTitle,
  setDescription,
  onSave,
  onClose,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Pin</h2>

        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
        </label>

        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>

          <button onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddPinModal;
