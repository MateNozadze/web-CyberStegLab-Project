namespace CyberStegLab.API.Models;

public class UserProgress
{
    public string UserId { get; set; } = string.Empty;
    public int TotalXP { get; set; }
    public int SolvedCount { get; set; }
    public List<string> UnlockedAchievements { get; set; } = new();
}
