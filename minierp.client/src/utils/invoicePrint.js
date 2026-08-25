import { generateQRString } from "qr-platba-generator";
import QRCode from "qrcode";
import { formatPrice, formatZip } from "./formatters";

const QR_CURRENCY_CODES = { "Kč": "CZK", CZK: "CZK", EUR: "EUR", USD: "USD" };

/**
 * Vygeneruje QR platbu (SPAYD) pro fakturu jako data URL obrázku, pokud má faktura
 * platný bankovní účet, kladnou částku a podporovanou měnu. Jinak vrátí null.
 * @param {Object} invoice - InvoiceDetailDTO
 * @returns {Promise<string|null>}
 */
const buildPaymentQrDataUrl = async (invoice) => {
    const amount = invoice.totalAmountIncVat;
    const currency = QR_CURRENCY_CODES[invoice.currencyCode];

    if (!invoice.bankAccount || !currency || !amount || amount <= 0) {
        return null;
    }

    try {
        const rawQrString = generateQRString({
            acc: invoice.bankAccount,
            am: amount,
            cc: currency,
            vs: invoice.variableSymbol?.replace(/\D/g, "") || undefined,
            msg: `Faktura ${invoice.invoiceNumber || invoice.id}`,
        });

        // qr-platba-generator emits VS/SS/KS without the "X-" prefix required by the
        // Czech "Krátký platební popis" spec for these national-extension fields —
        // banking apps look for X-VS specifically, so without it they can't read the
        // variable symbol. Patch the field names until upstream fixes this.
        const qrString = rawQrString.replace(/\*(VS|SS|KS):/g, "*X-$1:");

        return await QRCode.toDataURL(qrString, { margin: 1, width: 120 });
    } catch {
        return null;
    }
};

const formatDateCz = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("cs-CZ");
};

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[char]));

const buildPartyBlock = (title, party, showNote = false) => {
    if (!party) {
        return `
            <div class="party">
                <div class="party-title">${title}</div>
                <div class="party-empty">— neuvedeno —</div>
            </div>
        `;
    }

    const addressLine = [party.street, [formatZip(party.zip), party.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");

    return `
        <div class="party">
            <div class="party-title">${title}</div>
            <div class="party-name">${escapeHtml(party.name)}</div>
            ${addressLine ? `<div>${escapeHtml(addressLine)}</div>` : ""}
            ${party.ico ? `<div>IČO: ${escapeHtml(party.ico)}</div>` : ""}
            ${party.dic ? `<div>DIČ: ${escapeHtml(party.dic)}</div>` : ""}
            ${party.email ? `<div>${escapeHtml(party.email)}</div>` : ""}
            ${party.phone ? `<div>${escapeHtml(party.phone)}</div>` : ""}
            ${showNote && party.note ? `<div class="muted">${escapeHtml(party.note)}</div>` : ""}
        </div>
    `;
};

const buildVatBreakdown = (items) => {
    const groups = Object.values(
        (items || []).reduce((acc, item) => {
            const rate = item.vatRate || 0;
            const base = (item.unitPrice || 0) * (item.quantity || 0);
            const vat = base * rate;

            if (!acc[rate]) {
                acc[rate] = { rate, base: 0, vat: 0 };
            }
            acc[rate].base += base;
            acc[rate].vat += vat;

            return acc;
        }, {}),
    ).sort((a, b) => a.rate - b.rate);

    return groups;
};

const INVOICE_DOC_STYLE = `
    .invoice-doc, .invoice-doc * { box-sizing: border-box; }
    .invoice-doc {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #0f172a;
        font-size: 13px;
        line-height: 1.5;
        background: #fff;
    }
    .invoice-doc h1 { font-size: 22px; margin: 0 0 4px; }
    .invoice-doc .muted { color: #64748b; }
    .invoice-doc .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 3px solid #1f3a5f;
        padding-bottom: 16px;
        margin-bottom: 20px;
    }
    .invoice-doc .header .number { font-size: 15px; margin-top: 4px; }
    .invoice-doc .parties { display: flex; gap: 24px; margin-bottom: 20px; }
    .invoice-doc .party {
        flex: 1;
        border: 1px solid #d0d9e2;
        border-radius: 8px;
        padding: 12px 14px;
    }
    .invoice-doc .party-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 6px;
    }
    .invoice-doc .party-name { font-weight: 700; margin-bottom: 2px; }
    .invoice-doc .party-empty { color: #94a3b8; font-style: italic; }
    .invoice-doc .meta {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }
    .invoice-doc .meta-box { border: 1px solid #d0d9e2; border-radius: 8px; padding: 8px 12px; }
    .invoice-doc .meta-box .label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
    }
    .invoice-doc .meta-box .value { font-weight: 600; margin-top: 2px; }
    .invoice-doc table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .invoice-doc th, .invoice-doc td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .invoice-doc th {
        background: #1f3a5f;
        color: #fff;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .invoice-doc td.num, .invoice-doc th.num { text-align: right; }
    .invoice-doc td.strong { font-weight: 700; }
    .invoice-doc .totals-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 24px; }
    .invoice-doc .totals-right { display: flex; gap: 24px; }
    .invoice-doc .qr-block { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .invoice-doc .qr-block img { width: 100px; height: 100px; }
    .invoice-doc .qr-block .qr-caption { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .invoice-doc .vat-table { width: 320px; }
    .invoice-doc .totals-box { width: 280px; border: 1px solid #d0d9e2; border-radius: 8px; padding: 14px 16px; }
    .invoice-doc .totals-box .line { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .invoice-doc .totals-box .line.total { border-top: 2px solid #1f3a5f; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: 700; }
    .invoice-doc .footer {
        margin-top: 28px;
        padding-top: 12px;
        border-top: 1px solid #d0d9e2;
        font-size: 13px;
        font-weight: 700;
        color: #1f3a5f;
        text-align: center;
    }
    /* .pdf-page wraps the container used for the client-side (html2pdf) export —
       gives .invoice-doc the height of one A4 page (at the 700px container width,
       minus the 10mm jsPDF margin on each side) so the footer can be pinned to the
       bottom of the page instead of trailing right after the content. */
    .pdf-page .invoice-doc { min-height: 1020px; display: flex; flex-direction: column; }
    .pdf-page .footer { margin-top: auto; }
`;

/**
 * Sestaví vnitřní obsah faktury (daňového dokladu) — sdílené jádro pro tisk i export do PDF.
 * @param {Object} invoice - InvoiceDetailDTO z API (vč. supplier, customer, items)
 * @returns {Promise<string>}
 */
const buildInvoiceBodyHtml = async (invoice) => {
    const currency = invoice.currencyCode || "CZK";
    const isVatPayer = Boolean(invoice.supplier?.dic?.trim());
    const title = isVatPayer ? "Faktura – daňový doklad" : "Faktura";
    const items = invoice.items || [];
    const vatBreakdown = buildVatBreakdown(items);
    const qrDataUrl = await buildPaymentQrDataUrl(invoice);

    const itemColumnCount = isVatPayer ? 6 : 4;

    const itemRows = items.map((item) => {
        const description = item.description || "—";

        return `
            <tr>
                <td>${escapeHtml(description)}</td>
                <td class="num">${item.quantity}</td>
                <td class="num">${formatPrice(item.unitPrice || 0, currency)}</td>
                ${isVatPayer ? `
                    <td class="num">${((item.vatRate || 0) * 100).toFixed(0)} %</td>
                    <td class="num">${formatPrice((item.unitPrice || 0) * (item.quantity || 0), currency)}</td>
                ` : ""}
                <td class="num strong">${formatPrice(item.totalPrice || 0, currency)}</td>
            </tr>
        `;
    }).join("");

    const vatRows = vatBreakdown.map((row) => `
        <tr>
            <td>${(row.rate * 100).toFixed(0)} %</td>
            <td class="num">${formatPrice(row.base, currency)}</td>
            <td class="num">${formatPrice(row.vat, currency)}</td>
        </tr>
    `).join("");

    return `
        <div class="invoice-doc">
            <div class="header">
                <div>
                    <h1>${escapeHtml(title)}</h1>
                    <div class="number">Číslo dokladu: <strong>${escapeHtml(invoice.invoiceNumber || `#${invoice.id}`)}</strong></div>
                </div>
            </div>

            <div class="parties">
                ${buildPartyBlock("Dodavatel", invoice.supplier, true)}
                ${buildPartyBlock("Odběratel", invoice.customer)}
            </div>

            <div class="meta">
                <div class="meta-box">
                    <div class="label">Datum vystavení</div>
                    <div class="value">${formatDateCz(invoice.issueDate)}</div>
                </div>
                <div class="meta-box">
                    <div class="label">Datum splatnosti</div>
                    <div class="value">${formatDateCz(invoice.dueDate)}</div>
                </div>
                <div class="meta-box">
                    <div class="label">Způsob platby</div>
                    <div class="value">${escapeHtml(invoice.paymentMethod || "—")}</div>
                </div>
                <div class="meta-box">
                    <div class="label">Číslo bankovního účtu</div>
                    <div class="value">${escapeHtml(invoice.bankAccount || "—")}</div>
                </div>
                <div class="meta-box">
                    <div class="label">Variabilní symbol</div>
                    <div class="value">${escapeHtml(invoice.variableSymbol || "—")}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Označení zboží / služby</th>
                        <th class="num">Množství</th>
                        <th class="num">Jedn. cena</th>
                        ${isVatPayer ? `
                            <th class="num">Sazba DPH</th>
                            <th class="num">Základ daně</th>
                        ` : ""}
                        <th class="num">Celkem</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows || `<tr><td colspan="${itemColumnCount}" class="muted">Faktura neobsahuje žádné položky.</td></tr>`}
                </tbody>
            </table>

            <div class="totals-row">
                <div class="qr-block">
                    ${qrDataUrl ? `
                        <img src="${qrDataUrl}" alt="QR platba" />
                        <div class="qr-caption">QR platba</div>
                    ` : ""}
                </div>
                <div class="totals-right">
                    ${isVatPayer && vatBreakdown.length > 0 ? `
                        <table class="vat-table">
                            <thead>
                                <tr>
                                    <th>Sazba DPH</th>
                                    <th class="num">Základ daně</th>
                                    <th class="num">Výše DPH</th>
                                </tr>
                            </thead>
                            <tbody>${vatRows}</tbody>
                        </table>
                    ` : ""}
                    <div class="totals-box">
                        ${isVatPayer ? `
                            <div class="line"><span class="muted">Celkem bez DPH</span><span>${formatPrice(invoice.totalAmountExVat || 0, currency)}</span></div>
                            <div class="line"><span class="muted">DPH</span><span>${formatPrice(invoice.vatAmount || 0, currency)}</span></div>
                        ` : ""}
                        <div class="line total"><span>K úhradě</span><span>${formatPrice(invoice.totalAmountIncVat || 0, currency)}</span></div>
                    </div>
                </div>
            </div>

            <div class="footer">
                ${isVatPayer ? "Vystaveno jako plátce DPH." : "Vystavovatel není plátcem DPH."}
            </div>
        </div>
    `;
};

/**
 * Sestaví samostatný HTML dokument faktury (daňového dokladu) pro tisk.
 * @param {Object} invoice - InvoiceDetailDTO z API (vč. supplier, customer, items)
 * @returns {Promise<string>}
 */
export const buildInvoicePrintHtml = async (invoice) => `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(invoice.invoiceNumber || `Faktura ${invoice.id}`)}</title>
<style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; }
    ${INVOICE_DOC_STYLE}
    @media print {
        /* Browsers reserve the @page margin for their own header/footer
           (date, title, URL, page number). Zeroing it and padding the body
           instead keeps our layout inset without that space being available
           for the browser to draw into, which suppresses those headers/footers. */
        body { padding: 16mm; }
        @page { margin: 0; }
        /* Pin the footer to the bottom of the printed page instead of letting it
           trail right after the content. */
        .invoice-doc { min-height: calc(100vh - 32mm); display: flex; flex-direction: column; }
        .footer { margin-top: auto; }
    }
</style>
</head>
<body>
    ${await buildInvoiceBodyHtml(invoice)}
</body>
</html>`;

/**
 * Vytiskne fakturu (nebo uloží do PDF přes dialog tisku prohlížeče) bez otevírání nového okna.
 * @param {Object} invoice - InvoiceDetailDTO
 */
export const printInvoice = async (invoice) => {
    const html = await buildInvoicePrintHtml(invoice);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const cleanup = () => {
        if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    };

    iframe.onload = () => {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.focus();
        iframeWindow.print();
        iframeWindow.addEventListener("afterprint", cleanup);
        setTimeout(cleanup, 10000);
    };

    iframe.srcdoc = html;
};

/**
 * Vygeneruje PDF faktury na straně klienta a vrátí ho jako Blob.
 * @param {Object} invoice - InvoiceDetailDTO
 * @returns {Promise<Blob>}
 */
const generateInvoicePdfBlob = async (invoice) => {
    const { default: html2pdf } = await import("html2pdf.js");

    // Deliberately left in normal (static) document flow: html2canvas measures
    // absolutely/fixed-positioned targets with auto height as 0, which produced
    // blank PDFs. Callers must invoke this only while some full-viewport overlay
    // (e.g. the invoice modal) hides it, since it briefly renders at the end of <body>.
    const container = document.createElement("div");
    // A4 is 210mm (~793.7px @96dpi) wide; with a 10mm margin on each side the
    // printable width is ~718px. Stay comfortably under that so nothing crops.
    container.style.width = "700px";
    container.style.pointerEvents = "none";
    container.className = "pdf-page";
    container.innerHTML = `<style>${INVOICE_DOC_STYLE}</style>${await buildInvoiceBodyHtml(invoice)}`;
    document.body.appendChild(container);

    try {
        const blob = await html2pdf()
            .set({
                margin: 10,
                filename: `Faktura-${invoice.invoiceNumber || invoice.id}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(container)
            .outputPdf("blob");

        return blob;
    } finally {
        document.body.removeChild(container);
    }
};

/**
 * Vygeneruje PDF faktury a nabídne jej jako přílohu e-mailu.
 * Na platformách podporujících Web Share API (s přílohami) otevře nativní nabídku
 * sdílení, kde lze zvolit e-mailového klienta a PDF se do zprávy přiloží automaticky.
 * Jinak PDF stáhne a otevře výchozího e-mailového klienta se stejným obsahem zprávy.
 * @param {Object} invoice - InvoiceDetailDTO
 * @returns {Promise<{ shared: boolean }>}
 */
export const shareInvoicePdfByEmail = async (invoice) => {
    const blob = await generateInvoicePdfBlob(invoice);
    const filename = `Faktura-${invoice.invoiceNumber || invoice.id}.pdf`;
    const file = new File([blob], filename, { type: "application/pdf" });

    const subject = `Faktura ${invoice.invoiceNumber || invoice.id}`;
    const body = `Dobrý den,\n\nv příloze zasíláme fakturu č. ${invoice.invoiceNumber || invoice.id} se splatností ${formatDateCz(invoice.dueDate)}.\n\nS pozdravem`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            files: [file],
            title: subject,
            text: body,
        });
        return { shared: true };
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    const to = invoice.customer?.email || "";
    const fallbackBody = `${body}\n\n(PDF faktury bylo staženo do počítače – prosím přiložte jej k této zprávě ručně.)`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fallbackBody)}`;

    return { shared: false };
};
