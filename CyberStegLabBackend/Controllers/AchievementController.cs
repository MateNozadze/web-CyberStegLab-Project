using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Controllers;

// Achievement-ების (მიღწევების) მართვის API კონტროლერი
[ApiController]
[Route("api/[controller]")]
public class AchievementController : ControllerBase
{
    // Achievement-ებთან დაკავშირებული ბიზნეს-ლოგიკის სერვისი (DI-ით ინექცირებული)
    private readonly IAchievementService _achievements;

    // კონსტრუქტორი — სერვისის ინსტანციის მიღება dependency injection-ით
    public AchievementController(IAchievementService achievements) => _achievements = achievements;

    // ყველა არსებული achievement-ის სიის დაბრუნება
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _achievements.GetAllAsync());

    // კონკრეტული მომხმარებლის მიერ მოპოვებული achievement-ების დაბრუნება
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserAchievements(string userId) =>
        Ok(await _achievements.GetUserAchievementsAsync(userId));

    // ახალი achievement-ის შექმნა მოთხოვნაში გადმოცემული მონაცემებით
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAchievementRequest req)
    {
        await _achievements.CreateAsync(req);
        return Ok(new { message = "Achievement შეიქმნა" });
    }
}
