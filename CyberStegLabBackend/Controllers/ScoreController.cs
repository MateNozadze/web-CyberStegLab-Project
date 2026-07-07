using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services;

namespace CyberStegLab.API.Controllers;

// ქულების მართვის კონტროლერი - ქულის დამატება, მომხმარებლის ჯამური ქულის და ლიდერბორდის მიღება
[ApiController]
[Route("api/[controller]")]
public class ScoreController : ControllerBase
{
    private readonly IScoreService _scores;

    public ScoreController(IScoreService scores) => _scores = scores;

    [HttpPost("add")]
    public async Task<IActionResult> Add([FromBody] AddScoreRequest req)
    {
        await _scores.AddAsync(req);
        return Ok(new { message = "ქულა დაემატა" });
    }

    [HttpGet("total/{userId}")]
    public async Task<IActionResult> GetTotal(string userId) =>
        Ok(new { userId, totalPoints = await _scores.GetTotalAsync(userId) });

    [HttpGet("leaderboard")]
    public async Task<IActionResult> Leaderboard() =>
        Ok(await _scores.GetLeaderboardAsync());
}
