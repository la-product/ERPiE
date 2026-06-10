using Microsoft.AspNetCore.Mvc;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase {
    private readonly CustomerService _service;

    public CustomerController(CustomerService service) {
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
    public IActionResult Post(CreateCustomerDTO createDto) {
        var dto = _service.Create(createDto);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, UpdateCustomerDTO updateDto) {
        var dto = _service.Update(id, updateDto);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id) {
        if (!_service.Delete(id)) return NotFound();
        return NoContent();
    }
}