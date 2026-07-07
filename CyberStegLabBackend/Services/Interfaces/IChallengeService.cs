using CyberStegLab.API.DTOs;

namespace CyberStegLab.API.Services;

public interface IChallengeService
{
    Task<List<object>> GetAllAsync(string? difficulty = null);
    Task<object?> GetByIdAsync(string id);
    Task CreateAsync(CreateChallengeRequest req);
    Task<(bool Correct, int Points)> SubmitFlagAsync(string id, string flag);
    Task<(bool Correct, int Points)> SubmitAndSaveAsync(string id, SubmitAnswerRequest req);
    Task DeleteAsync(string id);
    Task UpdateAsync(string id, CreateChallengeRequest req);
    Task<object?> GetByIdForAdminAsync(string id);
}
