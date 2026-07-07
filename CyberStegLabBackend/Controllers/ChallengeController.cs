using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services;

namespace CyberStegLab.API.Controllers;

// Challenge-ების (გამოწვევების) მართვის კონტროლერი - სია, ერთი challenge-ის მიღება,
// შექმნა და პასუხის submit-ი ქულების დაანგარიშებით


[ApiController]
[Route("api/[controller]")]
public class ChallengeController : ControllerBase
{
    private readonly IChallengeService _challenges;

    public ChallengeController(IChallengeService challenges) => _challenges = challenges;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? difficulty = null) =>
        Ok(await _challenges.GetAllAsync(difficulty));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var challenge = await _challenges.GetByIdAsync(id);
        return challenge is null ? NotFound(new { error = "Challenge არ მოიძებნა" }) : Ok(challenge);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateChallengeRequest req)
    {
        await _challenges.CreateAsync(req);
        return Ok(new { message = "Challenge შეიქმნა" });
    }

    // submit + score ავტომატურად იწერება
    [HttpPost("{id}/submit")]
    public async Task<IActionResult> Submit(string id, [FromBody] SubmitAnswerRequest req)
    {
        var (correct, points) = await _challenges.SubmitAndSaveAsync(id, req);
        if (!correct) return BadRequest(new { correct = false, message = "არასწორი პასუხი" });
        return Ok(new { correct = true, points });
    }
}
