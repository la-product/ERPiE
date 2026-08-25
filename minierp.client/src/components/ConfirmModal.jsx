function ConfirmModal({
    show,
    title = "Potvrzení",
    message,
    confirmLabel = "Smazat",
    cancelLabel = "Zrušit",
    onConfirm,
    onCancel,
}) {
    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button className="btn-close" onClick={onCancel} />
                    </div>
                    <div className="modal-body">
                        <p className="mb-0">{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onCancel}>
                            {cancelLabel}
                        </button>
                        <button className="btn btn-danger" onClick={onConfirm}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
