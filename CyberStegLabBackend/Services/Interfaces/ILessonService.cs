using CyberStegLab.API.DTOs;

namespace CyberStegLab.API.Services.Interfaces;

public interface ILessonService
{
    Task<List<object>> GetAllAsync();
    Task<object?> GetByIdAsync(string id);
    Task CreateAsync(CreateLessonRequest req);
    Task UpdateAsync(string id, UpdateLessonRequest req);
    Task DeleteAsync(string id);
}