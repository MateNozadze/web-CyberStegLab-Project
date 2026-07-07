using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Controllers;

// Quiz-ის კითხვების მართვის კონტროლერი - challenge-ის მიხედვით კითხვების მიღება, დამატება და პასუხის შემოწმება
[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quiz;

    public QuizController(IQuizService quiz) => _quiz = quiz;

    [HttpGet("{challengeId}")]
    public async Task<IActionResult> GetQuestions(string challengeId) =>
        Ok(await _quiz.GetByChallengeAsync(challengeId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuizQuestionRequest req)
    {
        await _quiz.CreateAsync(req);
        return Ok(new { message = "კითხვა დაემატა" });
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubmitQuizRequest req)
    {
        var correct = await _quiz.SubmitAsync(req);
        return Ok(new { correct, message = correct ? "სწორია!" : "არასწორი" });
    }
}
