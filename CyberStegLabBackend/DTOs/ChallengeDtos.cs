namespace CyberStegLab.API.DTOs;

public record CreateChallengeRequest(
    string Title,
    string Description,
    string Difficulty,
    string Type,
    int XP,
    string CorrectAnswer,
    string ImagePath = "",
    List<string>? Options = null,
    string Hint = ""
);

public record SubmitAnswerRequest(string UserId, string Answer);
