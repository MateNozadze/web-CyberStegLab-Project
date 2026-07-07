using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services;

namespace CyberStegLab.API.Controllers;

// მომხმარებლის ავთენტიფიკაციის კონტროლერი - რეგისტრაცია და შესვლა Firebase Auth-ის საშუალებით

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (success, result) = await _auth.RegisterAsync(req.Email, req.Password, req.Username);
        return success ? Content(result, "application/json") : BadRequest(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (success, result) = await _auth.LoginAsync(req.Email, req.Password);
        return success ? Content(result, "application/json") : BadRequest(result);
    }
}
