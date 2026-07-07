using Google.Cloud.Firestore;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Services.Implementation;

public class QuizService : IQuizService
{
    private readonly FirestoreDb _db;

    public QuizService(FirestoreDb db) => _db = db;

    // challenge-ის მიხედვით quiz კითხვების მიღება
    public async Task<List<object>> GetByChallengeAsync(string challengeId)
    {
        var snapshot = await _db.Collection("quizQuestions")
            .WhereEqualTo("challengeId", challengeId)
            .GetSnapshotAsync();

        return snapshot.Documents.Select(doc => (object)new
        {
            id          = doc.Id,
            challengeId = doc.GetValue<string>("challengeId"),
            question    = doc.GetValue<string>("question"),
            options     = doc.GetValue<List<string>>("options")
        }).ToList();
    }

    // ახალი quiz კითხვის შექმნა
    public async Task CreateAsync(CreateQuizQuestionRequest req)
    {
        var data = new Dictionary<string, object>
        {
            { "challengeId",   req.ChallengeId },
            { "question",      req.Question },
            { "options",       req.Options },
            { "correctOption", req.CorrectOption }
        };
        await _db.Collection("quizQuestions").AddAsync(data);
    }


    // მომხმარებლის პასუხის შემოწმება challenge-ის პირველი quiz კითხვის მიმართ
    public async Task<bool> SubmitAsync(SubmitQuizRequest req)
    {
        var snapshot = await _db.Collection("quizQuestions")
            .WhereEqualTo("challengeId", req.ChallengeId)
            .GetSnapshotAsync();

        if (!snapshot.Documents.Any()) return false;

        var doc = snapshot.Documents.First();
        var correct = doc.GetValue<string>("correctOption");
        return req.Answer.Trim() == correct.Trim();
    }
}
