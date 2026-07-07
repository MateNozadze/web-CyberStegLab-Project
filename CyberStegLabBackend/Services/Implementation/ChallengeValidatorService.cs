using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Services.Implementation;

// Challenge-ის ტიპის მიხედვით მომხმარებლის პასუხის ვალიდაცია
// (stego - case-insensitive, დანარჩენი - ზუსტი დამთხვევა)
public class ChallengeValidatorService : IChallengeValidatorService
{
    public bool Validate(string challengeType, string userAnswer, string correctAnswer)
    {
        return challengeType switch
        {
            "stego"    => ValidateStego(userAnswer, correctAnswer),
            "quiz"     => ValidateExact(userAnswer, correctAnswer),
            "rgb"      => ValidateExact(userAnswer, correctAnswer),
            "password" => ValidateExact(userAnswer, correctAnswer),
            _          => ValidateExact(userAnswer, correctAnswer)
        };
    }

    // stego-სთვის case-insensitive და whitespace trim
    private static bool ValidateStego(string userAnswer, string correctAnswer) =>
        userAnswer.Trim().Equals(correctAnswer.Trim(), StringComparison.OrdinalIgnoreCase);

    // quiz/rgb/password ზუსტი შემოწმება
    private static bool ValidateExact(string userAnswer, string correctAnswer) =>
        userAnswer.Trim() == correctAnswer.Trim();
}
