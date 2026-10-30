using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniERP.Server.DTOs;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class UserController : ControllerBase {
    private readonly UserService _service;

    public UserController(UserService service) {
        _service = service;
    }

    [HttpGet]
    public IActionResult Get() {
        return Ok(_service.GetAll());
    }

    [HttpPost]
    public async Task<IActionResult> Post(CreateUserDTO createDto) {
        if (string.IsNullOrWhiteSpace(createDto.Username) || string.IsNullOrWhiteSpace(createDto.Password)) {
            return BadRequest(new { message = "Uživatelské jméno a heslo jsou povinné." });
        }

        var (dto, errors) = await _service.CreateAsync(createDto);
        if (dto == null) {
            return BadRequest(new { message = string.Join(" ", errors) });
        }

        return Ok(dto);
    }
}
