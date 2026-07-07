using Microsoft.AspNetCore.Mvc;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonController : ControllerBase
{
	private readonly ILessonService _lessons;

	public LessonController(ILessonService lessons) => _lessons = lessons;

    // ყველა lesson-ის სიის დაბრუნება
    [HttpGet]
	public async Task<IActionResult> GetAll() =>
		Ok(await _lessons.GetAllAsync());
    // კონკრეტული lesson-ის მიღება ID-ით
    [HttpGet("{id}")]
	public async Task<IActionResult> GetById(string id)
	{
		var lesson = await _lessons.GetByIdAsync(id);
		return lesson is null ? NotFound(new { error = "Lesson არ მოიძებნა" }) : Ok(lesson);
	}
    //ახალი lesson-ის შექმნა
    [HttpPost]
	public async Task<IActionResult> Create([FromBody] CreateLessonRequest req)
	{
		await _lessons.CreateAsync(req);
		return Ok(new { message = "Lesson შეიქმნა" });
	}
    //არსებული lesson-ის განახლება ID-ით
    [HttpPut("{id}")]
	public async Task<IActionResult> Update(string id, [FromBody] UpdateLessonRequest req)
	{
		await _lessons.UpdateAsync(id, req);
		return Ok(new { message = "Lesson განახლდა" });
	}
    // lesson-ის წაშლა ID-ით
    [HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		await _lessons.DeleteAsync(id);
		return Ok(new { message = "Lesson წაიშალა" });
	}
}