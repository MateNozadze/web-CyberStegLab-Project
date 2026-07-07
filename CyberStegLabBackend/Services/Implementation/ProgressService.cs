using Google.Cloud.Firestore;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Services.Implementation;

// მომხმარებლის მთლიანი პროგრესის აგრეგირება - ჯამური XP,
// გადაჭრილი challenge-ები და განბლოკილი achievement-ები ერთ ობიექტში
public class ProgressService : IProgressService
{
    private readonly FirestoreDb _db;

    public ProgressService(FirestoreDb db) => _db = db;

    public async Task<object> GetUserProgressAsync(string userId)
    {
        // ჯამური XP
        var scoresSnapshot = await _db.Collection("scores")
            .WhereEqualTo("userId", userId)
            .GetSnapshotAsync();

        var totalXP = scoresSnapshot.Documents.Sum(d => d.GetValue<int>("points"));

        // გადაჭრილი challenge-ები
        var challengesSnapshot = await _db.Collection("userChallenges")
            .WhereEqualTo("userId", userId)
            .WhereEqualTo("solved", true)
            .GetSnapshotAsync();

        var solvedCount = challengesSnapshot.Documents.Count;
        var solvedChallenges = challengesSnapshot.Documents.Select(d => new
        {
            challengeId = d.GetValue<string>("challengeId"),
            xpEarned    = d.GetValue<int>("xpEarned"),
            solvedAt    = d.GetValue<Timestamp>("solvedAt").ToDateTime()
        }).ToList();

        // განბლოკილი achievement-ები
        var achievementsSnapshot = await _db.Collection("userAchievements")
            .WhereEqualTo("userId", userId)
            .GetSnapshotAsync();

        var unlockedAchievements = achievementsSnapshot.Documents.Select(d => new
        {
            achievementId = d.GetValue<string>("achievementId"),
            unlockedAt    = d.GetValue<Timestamp>("unlockedAt").ToDateTime()
        }).ToList();

        return new
        {
            userId,
            totalXP,
            solvedCount,
            solvedChallenges,
            unlockedAchievements
        };
    }
}
