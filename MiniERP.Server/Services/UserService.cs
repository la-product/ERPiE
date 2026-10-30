using Microsoft.AspNetCore.Identity;
using MiniERP.Server.DTOs;
using MiniERP.Server.Mappers;
using MiniERP.Server.Models;

namespace MiniERP.Server.Services;

public class UserService {
    private readonly UserManager<User> _userManager;

    public UserService(UserManager<User> userManager) {
        _userManager = userManager;
    }

    public List<UserDTO> GetAll() {
        return _userManager.Users
            .ToList()
            .Select(UserMapper.ToDto)
            .ToList();
    }

    public async Task<(UserDTO? Dto, IEnumerable<string> Errors)> CreateAsync(CreateUserDTO dto) {
        var user = new User {
            UserName = dto.Username,
            Role = string.IsNullOrWhiteSpace(dto.Role) ? "user" : dto.Role,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded) {
            return (null, result.Errors.Select(e => e.Description));
        }

        return (UserMapper.ToDto(user), Array.Empty<string>());
    }
}
