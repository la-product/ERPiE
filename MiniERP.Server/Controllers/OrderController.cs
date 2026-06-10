using Microsoft.AspNetCore.Mvc;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase {
    private readonly OrderService _service;

    public OrderController(OrderService service) {
        _service = service;
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
    public IActionResult Post(CreateOrderDTO createDto) {
        var dto = _service.Create(createDto);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, UpdateOrderDTO updateDto) {
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