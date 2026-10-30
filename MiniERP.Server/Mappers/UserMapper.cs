using MiniERP.Server.DTOs;
using MiniERP.Server.Models;

namespace MiniERP.Server.Mappers;

public static class UserMapper
{
    public static UserDTO ToDto(User u) => new()
    {
        Id = u.Id,
        Username = u.UserName ?? string.Empty,
        Role = u.Role
    };
}
