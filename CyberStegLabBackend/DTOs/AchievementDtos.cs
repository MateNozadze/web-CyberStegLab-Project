namespace CyberStegLab.API.DTOs;

public record CreateAchievementRequest(
    string Title,
    string Description,
    string Icon,
    int RequiredXP
);
