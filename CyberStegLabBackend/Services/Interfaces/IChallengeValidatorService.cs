namespace CyberStegLab.API.Services.Interfaces;

public interface IChallengeValidatorService
{
    bool Validate(string challengeType, string userAnswer, string correctAnswer);
}
