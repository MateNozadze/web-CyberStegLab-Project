using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progress;

    public ProgressController(IProgressService progress) => _progress = progress;

    // GET /api/progress/{userId}
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetProgress(string userId) =>
        Ok(await _progress.GetUserProgressAsync(userId));
}
