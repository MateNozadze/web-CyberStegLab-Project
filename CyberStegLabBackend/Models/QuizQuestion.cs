namespace CyberStegLab.API.Models;

public class QuizQuestion
{
    public string Id { get; set; } = string.Empty;
    public string ChallengeId { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string CorrectOption { get; set; } = string.Empty;
}
