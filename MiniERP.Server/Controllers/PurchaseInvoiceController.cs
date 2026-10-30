using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseInvoiceController : OwnedEntityControllerBase
{
    private readonly PurchaseInvoiceService _service;

    public PurchaseInvoiceController(PurchaseInvoiceService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_service.GetAll(CurrentUserId, IsAdmin));
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var dto = _service.GetById(id, CurrentUserId, IsAdmin);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public IActionResult Post(CreatePurchaseInvoiceDTO createDto)
    {
        var dto = _service.Create(createDto, CurrentUserId, IsAdmin, out var errorMessage);
        if (dto == null)
        {
            return BadRequest(new { message = errorMessage ?? "Došlou fakturu se nepodařilo vytvořit." });
        }

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, UpdatePurchaseInvoiceDTO updateDto)
    {
        var dto = _service.Update(id, updateDto, CurrentUserId, IsAdmin);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateStatus(int id, [FromBody] string status)
    {
        var dto = _service.UpdateStatus(id, status, CurrentUserId, IsAdmin);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        if (!_service.Delete(id, CurrentUserId, IsAdmin)) return NotFound();
        return NoContent();
    }
}
