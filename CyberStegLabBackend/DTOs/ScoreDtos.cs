namespace CyberStegLab.API.DTOs;

public record AddScoreRequest(string UserId, int Points, string? ChallengeId);
