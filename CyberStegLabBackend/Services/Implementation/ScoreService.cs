using Google.Cloud.Firestore;
using CyberStegLab.API.DTOs;

namespace CyberStegLab.API.Services;
// ქულების მართვის სერვისი - ქულის დამატება (ტრანზაქციით denormalized ლიდერბორდის განახლებით),
// ჯამური ქულის და ლიდერბორდის (username-ებით) მიღება
public class ScoreService : IScoreService
{
    private readonly FirestoreDb _db;

    public ScoreService(FirestoreDb db) => _db = db;

    public async Task AddAsync(AddScoreRequest req)
    {
        var data = new Dictionary<string, object>
        {
            { "userId",   req.UserId },
            { "points",   req.Points },
            { "solvedAt", Timestamp.FromDateTime(DateTime.UtcNow) }
        };
        if (req.ChallengeId != null) data["challengeId"] = req.ChallengeId;
        await _db.Collection("scores").AddAsync(data);


        var lbRef = _db.Collection("leaderboard").Document(req.UserId);
        await _db.RunTransactionAsync(async tx =>
        {
            var snap = await tx.GetSnapshotAsync(lbRef);
            var current = snap.Exists ? snap.GetValue<int>("totalPoints") : 0;
            tx.Set(lbRef, new Dictionary<string, object>
        {
            { "userId", req.UserId },
            { "totalPoints", current + req.Points }
        });
        });
    }

    public async Task<int> GetTotalAsync(string userId)
    {
        var doc = await _db.Collection("leaderboard").Document(userId).GetSnapshotAsync();
        return doc.Exists ? doc.GetValue<int>("totalPoints") : 0;
    }

    public async Task<List<object>> GetLeaderboardAsync()
    {
        var snapshot = await _db.Collection("leaderboard")
            .OrderByDescending("totalPoints")
            .Limit(50)
            .GetSnapshotAsync();

        var result = new List<object>();

        foreach (var d in snapshot.Documents)
        {
            var userId = d.GetValue<string>("userId");

            // users კოლექციიდან username ამოიღე
            var userDoc = await _db.Collection("users").Document(userId).GetSnapshotAsync();
            var username = userDoc.Exists
                ? userDoc.GetValue<string>("username")
                : userId;

            result.Add(new
            {
                userId,
                username,
                totalPoints = d.GetValue<int>("totalPoints")
            });
        }

        return result;
    }
}
