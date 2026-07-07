using Google.Cloud.Firestore;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Services;

public class ChallengeService : IChallengeService
{
    private readonly FirestoreDb _db;
    private readonly IChallengeValidatorService _validator;
    private readonly IScoreService _scores;
    private readonly IAchievementService _achievements;


    public ChallengeService(FirestoreDb db, IChallengeValidatorService validator, IScoreService scores, IAchievementService achievements)
    {
        _db        = db;
        _validator = validator;
        _scores    = scores;
        _achievements = achievements;
    }

    // ყველა challenge-ის სია, სურვილისამებრ difficulty-ის ფილტრით
    public async Task<List<object>> GetAllAsync(string? difficulty = null)
    {
        var collection = _db.Collection("challenges");

        QuerySnapshot snapshot = difficulty is not null
            ? await collection.WhereEqualTo("difficulty", difficulty).GetSnapshotAsync()
            : await collection.GetSnapshotAsync();

        return snapshot.Documents.Select(MapDoc).ToList<object>();
    }

    // კონკრეტული challenge-ის მიღება ID-ით
    public async Task<object?> GetByIdAsync(string id)
    {
        var doc = await _db.Collection("challenges").Document(id).GetSnapshotAsync();
        return doc.Exists ? MapDoc(doc) : null;
    }

    // ახალი challenge-ის შექმნა Firestore-ში
    public async Task CreateAsync(CreateChallengeRequest req)
    {
        var data = new Dictionary<string, object>
        {
            { "title",         req.Title },
            { "description",   req.Description },
            { "difficulty",    req.Difficulty },
            { "type",          req.Type },
            { "xp",            req.XP },
            { "correctAnswer", req.CorrectAnswer },
            { "imagePath",     req.ImagePath }
        };
        if (req.Options != null && req.Options.Any())
            data["options"] = req.Options;

        if (!string.IsNullOrEmpty(req.Hint))
            data["hint"] = req.Hint;
        await _db.Collection("challenges").AddAsync(data);
    }

    // პასუხის სისწორის შემოწმება, ქულების დაბრუნების გარეშე შენახვისა
    public async Task<(bool Correct, int Points)> SubmitFlagAsync(string id, string flag)
    {
        var doc = await _db.Collection("challenges").Document(id).GetSnapshotAsync();
        if (!doc.Exists) return (false, 0);

        var type    = doc.GetValue<string>("type");
        var correct = doc.GetValue<string>("correctAnswer");
        var xp      = doc.GetValue<int>("xp");

        var isCorrect = _validator.Validate(type, flag, correct);
        return (isCorrect, isCorrect ? xp : 0);
    }

    // პასუხის შემოწმება, ქულის შენახვა, achievement-ების განბლოკვა და გადაჭრის ისტორიის ჩაწერა (ორჯერ გადაჭრის დაცვით)
    public async Task<(bool Correct, int Points)> SubmitAndSaveAsync(string id, SubmitAnswerRequest req)
    {
        // ორჯერ გადაჭრის შემოწმება
        var already = await _db.Collection("userChallenges")
            .WhereEqualTo("userId", req.UserId)
            .WhereEqualTo("challengeId", id)
            .GetSnapshotAsync();

        if (already.Documents.Any())
            return (false, 0);

        var (correct, points) = await SubmitFlagAsync(id, req.Answer);

        if (correct)
        {
            // Score დაწერა
            await _scores.AddAsync(new AddScoreRequest(req.UserId, points, id));

            // Achievement შემოწმება
            var totalXP = await _scores.GetTotalAsync(req.UserId);
            await _achievements.CheckAndUnlockAsync(req.UserId, totalXP);

            // UserChallenge დაწერა
            await _db.Collection("userChallenges").AddAsync(new Dictionary<string, object>
            {
                { "userId",      req.UserId },
                { "challengeId", id },
                { "solved",      true },
                { "solvedAt",    Timestamp.FromDateTime(DateTime.UtcNow) },
                { "xpEarned",    points }
            });
        }

        return (correct, points);

    }


    public async Task<object?> GetByIdForAdminAsync(string id)
    {
        var doc = await _db.Collection("challenges").Document(id).GetSnapshotAsync();
        return doc.Exists ? MapDocForAdmin(doc) : null;
    }


    private static object MapDocForAdmin(DocumentSnapshot doc) => new
    {
        id = doc.Id,
        title = doc.GetValue<string>("title"),
        description = doc.ContainsField("description") ? doc.GetValue<string>("description") : "",
        difficulty = doc.GetValue<string>("difficulty"),
        type = doc.ContainsField("type") ? doc.GetValue<string>("type") : "",
        xp = doc.ContainsField("xp") ? doc.GetValue<int>("xp") : 0,
        imagePath = doc.ContainsField("imagePath") ? doc.GetValue<string>("imagePath") : "",
        question = doc.ContainsField("question") ? doc.GetValue<string>("question") : "",
        options = doc.ContainsField("options") ? doc.GetValue<List<string>>("options") : new List<string>(),
        hint = doc.ContainsField("hint") ? doc.GetValue<string>("hint") : "",
        correctAnswer = doc.ContainsField("correctAnswer") ? doc.GetValue<string>("correctAnswer") : "" // 👈 აი აქ მოაქვს სწორი პასუხიც
    };

    // Firestore დოკუმენტის გარდაქმნა object-ად (client-ისთვის დასაბრუნებელი ფორმატი)
    private static object MapDoc(DocumentSnapshot doc) => new
    {
        id = doc.Id,
        title = doc.GetValue<string>("title"),
        description = doc.ContainsField("description") ? doc.GetValue<string>("description") : "",
        difficulty = doc.GetValue<string>("difficulty"),
        type = doc.ContainsField("type") ? doc.GetValue<string>("type") : "",
        xp = doc.ContainsField("xp") ? doc.GetValue<int>("xp") : 0,
        imagePath = doc.ContainsField("imagePath") ? doc.GetValue<string>("imagePath") : "",
        question = doc.ContainsField("question") ? doc.GetValue<string>("question") : "",
        options = doc.ContainsField("options") ? doc.GetValue<List<string>>("options") : new List<string>(),
        hint = doc.ContainsField("hint") ? doc.GetValue<string>("hint") : ""
    };

    // challenge-ის წაშლა ID-ით
    public async Task DeleteAsync(string id)
    {
        await _db.Collection("challenges").Document(id).DeleteAsync();
    }

    // არსებული challenge-ის ველების განახლება (merge-ით, არსებული ველების შენარჩუნებით)
    public async Task UpdateAsync(string id, CreateChallengeRequest req)
    {
        var data = new Dictionary<string, object>
    {
        { "title",         req.Title },
        { "description",   req.Description },
        { "difficulty",    req.Difficulty },
        { "type",          req.Type },
        { "xp",            req.XP },
        { "imagePath",     req.ImagePath }
    };

        // ვამოწმებთ, რომ თუ ფრონტენდმა ცარიელი გამოაგზავნა, ბაზაში ძველი პასუხი არ გადაეწეროს
        if (!string.IsNullOrWhiteSpace(req.CorrectAnswer))
            data["correctAnswer"] = req.CorrectAnswer;

        if (!string.IsNullOrEmpty(req.Hint))
            data["hint"] = req.Hint;

        if (req.Options != null && req.Options.Any())
            data["options"] = req.Options;

        await _db.Collection("challenges").Document(id).SetAsync(data, SetOptions.MergeAll);
    }
}
