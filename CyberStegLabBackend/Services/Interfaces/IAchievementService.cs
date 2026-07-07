using CyberStegLab.API.DTOs;

namespace CyberStegLab.API.Services.Interfaces;

public interface IAchievementService
{
    Task<List<object>> GetAllAsync();
    Task CreateAsync(CreateAchievementRequest req);
    Task<List<object>> GetUserAchievementsAsync(string userId);
    Task CheckAndUnlockAsync(string userId, int totalXP);
}
