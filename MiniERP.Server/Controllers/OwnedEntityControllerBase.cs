using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace MiniERP.Server.Controllers;

/// <summary>
/// Základ pro kontrolery, které svá data filtrují podle vlastníka (Customer.OwnerId).
/// Čte "sub"/NameIdentifier claim napřímo, protože se v různých verzích JWT handleru
/// liší, jestli se krátký JWT claim typ mapuje na dlouhý ClaimTypes.NameIdentifier.
/// </summary>
public abstract class OwnedEntityControllerBase : ControllerBase {
    protected string? CurrentUserId =>
        User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

    protected bool IsAdmin => User.IsInRole("admin");
}
