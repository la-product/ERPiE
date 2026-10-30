import { useEffect, useState } from "react";
import { getInvoices } from "../services/invoiceService";
import { getPurchaseInvoices } from "../services/purchaseInvoiceService";

const defaultCurrency = "Kč";

function groupAmountsByCurrency(invoices = []) {
    return invoices.reduce((totals, invoice) => {
        const currency = invoice.currencyCode?.trim() || defaultCurrency;
        totals.set(currency, (totals.get(currency) || 0) + (Number(invoice.totalAmountIncVat) || 0));
        return totals;
    }, new Map());
}

function formatAmount(amount, currency) {
    return `${Number(amount || 0).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function Overview() {
    const [income, setIncome] = useState(new Map());
    const [expenses, setExpenses] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        Promise.all([getInvoices(), getPurchaseInvoices()])
            .then(([invoices, purchaseInvoices]) => {
                if (!isMounted) return;
                setIncome(groupAmountsByCurrency(invoices));
                setExpenses(groupAmountsByCurrency(purchaseInvoices));
            })
            .catch((err) => {
                if (isMounted) setError(err.message || "Nepodařilo se načíst finanční přehled.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const currencies = [...new Set([...income.keys(), ...expenses.keys()])].sort((a, b) => a.localeCompare(b, "cs-CZ"));
    if (currencies.length === 0) currencies.push(defaultCurrency);

    const rows = currencies.map((currency) => ({
        currency,
        income: income.get(currency) || 0,
        expenses: expenses.get(currency) || 0,
    }));
    const balances = rows.map(({ currency, income: incomeAmount, expenses: expenseAmount }) => ({
        currency,
        amount: incomeAmount - expenseAmount,
    }));

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Načítám přehled…</span></div></div>;
    }

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Přehled</h3>
                    <p className="text-muted mb-0">Souhrn vystavených a došlých faktur</p>
                </div>
                <div className="small text-muted">Aktualizováno při otevření přehledu</div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3 mb-4">
                <SummaryCard title="Příjmy" icon="bi bi-arrow-down-left-circle" color="#16835d" values={rows.map((row) => ({ currency: row.currency, amount: row.income }))} />
                <SummaryCard title="Výdaje" icon="bi bi-arrow-up-right-circle" color="#c44848" values={rows.map((row) => ({ currency: row.currency, amount: row.expenses }))} />
                <SummaryCard title="Rozdíl" icon="bi bi-wallet2" color="#3157a4" values={balances} />
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                        <div>
                            <h5 className="fw-bold mb-1">Příjmy a výdaje</h5>
                            <p className="text-muted small mb-0">Porovnání částek faktur v jejich měně</p>
                        </div>
                        <div className="d-flex gap-3 small">
                            <span><i className="bi bi-square-fill me-2" style={{ color: "#16835d" }} />Příjmy</span>
                            <span><i className="bi bi-square-fill me-2" style={{ color: "#c44848" }} />Výdaje</span>
                        </div>
                    </div>

                    {error ? (
                        <div className="text-muted py-4 text-center">Graf nelze zobrazit bez načtených faktur.</div>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            {rows.map((row) => (
                                <div key={row.currency}>
                                    <div className="fw-semibold mb-2">{row.currency}</div>
                                    <ComparisonBar label="Příjmy" amount={row.income} maximum={Math.max(row.income, row.expenses)} color="#16835d" currency={row.currency} />
                                    <ComparisonBar label="Výdaje" amount={row.expenses} maximum={Math.max(row.income, row.expenses)} color="#c44848" currency={row.currency} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, icon, color, values }) {
    return (
        <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, color, backgroundColor: `${color}15` }}>
                            <i className={icon} style={{ fontSize: 22 }} />
                        </div>
                        <h6 className="text-muted fw-semibold mb-0">{title}</h6>
                    </div>
                    <div className="d-flex flex-column gap-1">
                        {values.map(({ currency, amount }) => (
                            <div className="fs-5 fw-bold" key={currency}>{formatAmount(amount, currency)}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ComparisonBar({ label, amount, maximum, color, currency }) {
    const width = maximum > 0 ? (amount / maximum) * 100 : 0;

    return (
        <div className="d-flex align-items-center gap-3 mb-2">
            <span className="small text-muted" style={{ width: 58 }}>{label}</span>
            <div className="flex-grow-1 rounded-pill bg-light overflow-hidden" style={{ height: 14 }}>
                <div className="rounded-pill h-100" style={{ width: `${width}%`, backgroundColor: color, transition: "width 0.4s ease" }} />
            </div>
            <span className="small fw-semibold text-end" style={{ minWidth: 145 }}>{formatAmount(amount, currency)}</span>
        </div>
    );
}

export default Overview;
