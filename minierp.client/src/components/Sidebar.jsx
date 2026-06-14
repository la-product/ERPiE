import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.min.css";

function Sidebar({ activePage, setActivePage, user }) {
  const [openSection, setOpenSection] = useState("");

  const menu = [
    {
      label: "Adresář firem",
      icon: "bi bi-people",
      items: ["Seznam firem", "Přidat firmu"],
    },
    {
      label: "Produkty",
      icon: "bi bi-tags",
      items: ["Seznam produktů", "Přidat produkt"],
    },
    { label: "Sklad", icon: "bi bi-box-seam", items: ["Sklad — vše"] },
    { label: "Příjemky", icon: "bi bi-box-arrow-in-down", items: ["Seznam příjemek", "Vytvořit příjemku"] },
    { label: "Dodací list", icon: "bi bi-cart", items: ["Seznam DL", "Přidat DL"] },
    {
      label: "Faktury",
      icon: "bi bi-receipt",
      items: ["Seznam FV", "Přidat FV"],
    },
    ...(user?.role === 'admin' ? [{
      label: "Uživatelé",
      icon: "bi bi-person-gear",
      items: ["Seznam uživatelů", "Přidat uživatele"],
    }] : []),
  ];

  return (
    <div
      className="bg-white border-end d-flex flex-column"
      style={{ width: 260, boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}
    >
      <div className="p-4 border-bottom d-flex align-items-center justify-content-center">
        <i className="bi bi-box-seam me-2" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
        <h5 className="fw-bold mb-0" style={{ letterSpacing: '-0.03em', color: 'var(--text)' }}>ERPiE</h5>
      </div>
      <div className="px-3 py-4">
        <h6
          className="text-uppercase text-muted mb-3 px-3"
          style={{
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.1em",
          }}
        >
          Menu
        </h6>
      </div>
      <ul className="nav flex-column px-3">
        {menu.map((section) => (
          <li key={section.label} className="nav-item mb-1">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpenSection(
                  openSection === section.label ? "" : section.label,
                );
              }}
              className="nav-link rounded-3 text-dark d-flex justify-content-between align-items-center py-2 px-3"
              style={{
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor:
                  openSection === section.label ? "var(--primary-light)" : "transparent",
                color: openSection === section.label ? "var(--primary)" : "var(--text)",
                fontWeight: openSection === section.label ? "600" : "500",
              }}
            >
              <span>
                <i
                  className={`${section.icon} me-3`}
                  style={{ fontSize: "18px", opacity: openSection === section.label ? 1 : 0.7 }}
                ></i>
                {section.label}
              </span>
              <i
                className="bi bi-chevron-right"
                style={{
                  transition: "transform 0.3s",
                  transform:
                    openSection === section.label
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  fontSize: "12px",
                  opacity: 0.5
                }}
              ></i>
            </a>
            {openSection === section.label && (
              <ul className="nav flex-column ps-3 mt-1 ms-3 border-start">
                {section.items.map((item) => (
                  <li key={item} className="nav-item">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActivePage(item);
                      }}
                      className="nav-link rounded-3 py-2 px-3"
                      style={{
                        backgroundColor:
                          activePage === item ? "transparent" : "transparent",
                        border: activePage === item ? "1px solid var(--primary)" : "1px solid transparent",
                        color: activePage === item ? "var(--primary)" : "var(--text-muted)",
                        transition: "all 0.2s ease",
                        fontSize: "13.5px",
                        fontWeight: activePage === item ? "600" : "400",
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
