using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;
using Google.Cloud.Firestore;
using CyberStegLab.API.Services;

namespace CyberStegLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IChallengeService _challenges;
    private readonly ILessonService _lessons;
    private readonly FirestoreDb _db;

    public AdminController(IChallengeService challenges, ILessonService lessons, FirestoreDb db)
    {
        _challenges = challenges;
        _lessons = lessons;
        _db = db;
    }

    [HttpGet("challenges/{id}")]
    public async Task<IActionResult> GetChallengeForEdit(string id)
    {
        var challenge = await _challenges.GetByIdForAdminAsync(id);
        return challenge is null ? NotFound() : Ok(challenge);
    }
    // Admin უფლებების შემოწმება - Firebase token-ის ვერიფიკაცია და admins კოლექციაში მოძებნა

    private async Task<bool> IsAdmin()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
            return false;

        var token = authHeader.ToString().Replace("Bearer ", "");

        try
        {
            var decoded = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
            var email = decoded.Claims["email"].ToString();
            var doc = await _db.Collection("admins").Document(email).GetSnapshotAsync();
            return doc.Exists;
        }
        catch { return false; }
    }

    // მოწმდება არის თუ არა მომხმარებელი ადმინი
    [HttpGet("check")]
    public async Task<IActionResult> Check()
    {
        if (!await IsAdmin()) return Forbid();
        return Ok();
    }


    // CHALLENGES

    // ყველა challenge-ის სიის დაბრუნება (მხოლოდ ადმინისთვის)
    [HttpGet("challenges")]
    public async Task<IActionResult> GetChallenges()
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        return Ok(await _challenges.GetAllAsync());
    }
    // ახალი challenge-ის შექმნა

    [HttpPost("challenges")]
    public async Task<IActionResult> CreateChallenge([FromBody] CreateChallengeRequest req)
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        await _challenges.CreateAsync(req);
        return Ok(new { message = "Challenge შეიქმნა" });
    }

    // არსებული challenge-ის განახლება ID-ით
    [HttpPut("challenges/{id}")]
    public async Task<IActionResult> UpdateChallenge(string id, [FromBody] CreateChallengeRequest req)
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        await _challenges.UpdateAsync(id, req);
        return Ok(new { message = "Challenge განახლდა" });
    }
    // challenge-ის წაშლა ID-ით
    [HttpDelete("challenges/{id}")]
    public async Task<IActionResult> DeleteChallenge(string id)
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        await _challenges.DeleteAsync(id);
        return Ok(new { message = "Challenge წაიშალა" });
    }


    // LESSONS

    // ყველა lesson-ის სიის დაბრუნება (მხოლოდ ადმინისთვის)
    [HttpGet("lessons")]
    public async Task<IActionResult> GetLessons()
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        return Ok(await _lessons.GetAllAsync());
    }
    // ახალი lesson-ის შექმნა
    [HttpPost("lessons")]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonRequest req)
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        await _lessons.CreateAsync(req);
        return Ok(new { message = "Lesson შეიქმნა" });
    }
    // არსებული lesson-ის განახლება ID-ით
    [HttpPut("lessons/{id}")]
    public async Task<IActionResult> UpdateLesson(string id, [FromBody] UpdateLessonRequest req)
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        await _lessons.UpdateAsync(id, req);
        return Ok(new { message = "Lesson განახლდა" });
    }

    // lesson-ის წაშლა ID-ით
    [HttpDelete("lessons/{id}")]
    public async Task<IActionResult> DeleteLesson(string id)
    {
        if (!await IsAdmin()) return Unauthorized(new { error = "წვდომა აკრძალულია" });
        await _lessons.DeleteAsync(id);
        return Ok(new { message = "Lesson წაიშალა" });
    }
    
}