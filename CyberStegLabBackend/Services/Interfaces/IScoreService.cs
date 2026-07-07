using CyberStegLab.API.DTOs;

namespace CyberStegLab.API.Services;

public interface IScoreService
{
    Task AddAsync(AddScoreRequest req);
    Task<int> GetTotalAsync(string userId);
    Task<List<object>> GetLeaderboardAsync();
}
