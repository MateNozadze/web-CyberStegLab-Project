using CyberStegLab.API.DTOs;

namespace CyberStegLab.API.Services.Interfaces;

public interface IQuizService
{
    Task<List<object>> GetByChallengeAsync(string challengeId);
    Task CreateAsync(CreateQuizQuestionRequest req);
    Task<bool> SubmitAsync(SubmitQuizRequest req);
}
