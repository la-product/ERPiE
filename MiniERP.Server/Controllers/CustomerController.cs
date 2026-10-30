using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerController : OwnedEntityControllerBase {
    private readonly CustomerService _service;
    private readonly AresService _aresService;

    public CustomerController(CustomerService service, AresService aresService) {
        _service = service;
        _aresService = aresService;
    }

    [HttpGet]
    public IActionResult Get() {
        return Ok(_service.GetAll(CurrentUserId, IsAdmin));
    }

    [HttpGet("ares/{ico}")]
    public async Task<IActionResult> GetFromAres(string ico) {
        if (!Regex.IsMatch(ico, @"^\d{8}$")) {
            return BadRequest(new { message = "IČO musí mít přesně 8 číslic." });
        }

        var company = await _aresService.GetByIcoAsync(ico);
        if (company == null) {
            return NotFound(new { message = "Subjekt s tímto IČO nebyl v ARESu nalezen." });
        }

        return Ok(company);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id) {
        var dto = _service.GetById(id, CurrentUserId, IsAdmin);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public IActionResult Post(CreateCustomerDTO createDto) {
        var dto = _service.Create(createDto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, UpdateCustomerDTO updateDto) {
        var dto = _service.Update(id, updateDto, CurrentUserId, IsAdmin);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id) {
        if (!_service.Delete(id, CurrentUserId, IsAdmin)) return NotFound();
        return NoContent();
    }
}