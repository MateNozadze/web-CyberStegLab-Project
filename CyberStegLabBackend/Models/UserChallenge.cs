namespace CyberStegLab.API.Models;

public class UserChallenge
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string ChallengeId { get; set; } = string.Empty;
    public bool Solved { get; set; }
    public DateTime SolvedAt { get; set; }
    public int XPEarned { get; set; }
}
