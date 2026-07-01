using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReceiptController : ControllerBase {
    private readonly ReceiptService _service;
    private readonly InvoiceImportService _invoiceImportService;

    public ReceiptController(ReceiptService service, InvoiceImportService invoiceImportService) {
        _service = service;
        _invoiceImportService = invoiceImportService;
    }

    [HttpGet]
    public IActionResult Get() {
        return Ok(_service.GetAll());
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id) {
        var dto = _service.GetById(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public IActionResult Post(CreateReceiptDTO createDto) {
        var dto = _service.Create(createDto);
        if (dto == null) return BadRequest("Dodavatel neexistuje nebo není označen jako dodavatel.");
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id) {
        if (!_service.Delete(id)) return NotFound();
        return NoContent();
    }

    [HttpPost("import-invoice")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> ImportInvoice(IFormFile? file) {
        if (file == null || file.Length == 0) return BadRequest("Nebyl nahrán žádný soubor.");
        if (!string.Equals(Path.GetExtension(file.FileName), ".pdf", StringComparison.OrdinalIgnoreCase)) {
            return BadRequest("Podporovány jsou pouze PDF soubory.");
        }

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);

        try {
            var result = await _invoiceImportService.ExtractFromPdfAsync(ms.ToArray());
            return Ok(result);
        } catch (Exception ex) {
            return StatusCode(502, $"Nepodařilo se zpracovat fakturu: {ex.Message}");
        }
    }
}
