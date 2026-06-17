using Microsoft.AspNetCore.Mvc;
using MiniERP.Server.Models;
using MiniERP.Server.DTOs;
using Microsoft.AspNetCore.Identity;
using MiniERP.Server.Services;

namespace MiniERP.Server.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
    private readonly UserManager<User> _userManager;
    private readonly JwtService _jwtService;

    public AuthController(UserManager<User> userManager, JwtService jwtService) {
        _userManager = userManager;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDTO request) {
        var user = await _userManager.FindByNameAsync(request.Username);

        if (user == null)
            return Unauthorized(new { message = "Neplatné jméno nebo heslo" });

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!passwordValid)
            return Unauthorized(new { message = "Neplatné jméno nebo heslo" });

        var token = _jwtService.GenerateToken(user);

        return Ok(new LoginResponseDTO {
            Username = user.UserName ?? string.Empty,
            Role = user.Role,
            Token = token,
        });
    }
}
