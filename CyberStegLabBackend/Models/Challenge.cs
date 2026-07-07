namespace CyberStegLab.API.Models;

public class Challenge
{
    public string Id { get; set; } = string.Empty; 
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;    
    public string Type { get; set; } = string.Empty;
    public int XP { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
}
