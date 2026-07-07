using Google.Cloud.Firestore;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Services.Implementation;

public class AchievementService : IAchievementService
{
    private readonly FirestoreDb _db;

    public AchievementService(FirestoreDb db) => _db = db;

    // ყველა achievement-ის სიის დაბრუნება Firestore-დან
    public async Task<List<object>> GetAllAsync()
    {
        var snapshot = await _db.Collection("achievements").GetSnapshotAsync();
        return snapshot.Documents.Select(MapDoc).ToList<object>();
    }

    // ახალი achievement-ის შექმნა Firestore-ში
    public async Task CreateAsync(CreateAchievementRequest req)
    {
        var data = new Dictionary<string, object>
        {
            { "title",       req.Title },
            { "description", req.Description },
            { "icon",        req.Icon },
            { "requiredXP",  req.RequiredXP }
        };
        await _db.Collection("achievements").AddAsync(data);
    }

    // მომხმარებლის მიერ უკვე მოპოვებული achievement-ების სია (userId-ის მიხედვით)
    public async Task<List<object>> GetUserAchievementsAsync(string userId)
    {
        var snapshot = await _db.Collection("userAchievements")
            .WhereEqualTo("userId", userId)
            .GetSnapshotAsync();

        return snapshot.Documents.Select(doc => (object)new
        {
            achievementId = doc.GetValue<string>("achievementId"),
            unlockedAt    = doc.GetValue<Timestamp>("unlockedAt").ToDateTime()
        }).ToList();
    }

    // XP-ის მიხედვით achievement-ების განბლოკვა
    public async Task CheckAndUnlockAsync(string userId, int totalXP)
    {
        var achievements = await _db.Collection("achievements").GetSnapshotAsync();

        foreach (var doc in achievements.Documents)
        {
            var required = doc.GetValue<int>("requiredXP");
            if (totalXP < required) continue;

            // უკვე განბლოკილია თუ არა
            var existing = await _db.Collection("userAchievements")
                .WhereEqualTo("userId", userId)
                .WhereEqualTo("achievementId", doc.Id)
                .GetSnapshotAsync();

            if (existing.Documents.Any()) continue;

            await _db.Collection("userAchievements").AddAsync(new Dictionary<string, object>
            {
                { "userId",        userId },
                { "achievementId", doc.Id },
                { "unlockedAt",    Timestamp.FromDateTime(DateTime.UtcNow) }
            });
        }
    }

    // Firestore დოკუმენტის გარდაქმნა object-ად (client-ისთვის დასაბრუნებელი ფორმატი)
    private static object MapDoc(DocumentSnapshot doc) => new
    {
        id          = doc.Id,
        title       = doc.GetValue<string>("title"),
        description = doc.GetValue<string>("description"),
        icon        = doc.GetValue<string>("icon"),
        requiredXP  = doc.GetValue<int>("requiredXP")
    };
}
