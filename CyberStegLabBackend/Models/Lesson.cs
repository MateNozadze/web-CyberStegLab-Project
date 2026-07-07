namespace CyberStegLab.API.Models;

public class Lesson
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty; // beginner / intermediate / advanced
    public int Order { get; set; } // რიგითობა sidebar-ში
    public DateTime CreatedAt { get; set; }
}