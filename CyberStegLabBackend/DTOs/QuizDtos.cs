namespace CyberStegLab.API.DTOs;

public record CreateQuizQuestionRequest(
    string ChallengeId,
    string Question,
    List<string> Options,
    string CorrectOption
);

public record SubmitQuizRequest(string UserId, string ChallengeId, string Answer);
