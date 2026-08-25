using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase {
    private readonly InvoiceService _service;

    public InvoiceController(InvoiceService service) {
        _service = service;
    }

    [HttpGet]
    public IActionResult Get() {
        return Ok(_service.GetAll());
    }

    [HttpGet("next-number")]
    public IActionResult GetNextNumber() {
        return Ok(new { invoiceNumber = _service.PreviewNextInvoiceNumber() });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id) {
        var dto = _service.GetById(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public IActionResult Post(CreateInvoiceDTO createDto) {
        var dto = _service.Create(createDto);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, UpdateInvoiceDTO updateDto) {
        var dto = _service.Update(id, updateDto);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateStatus(int id, [FromBody] string status) {
        var dto = _service.UpdateStatus(id, status);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id) {
        if (!_service.Delete(id)) return NotFound();
        return NoContent();
    }
}