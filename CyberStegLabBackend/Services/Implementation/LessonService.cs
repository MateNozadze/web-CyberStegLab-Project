using Google.Cloud.Firestore;
using CyberStegLab.API.DTOs;
using CyberStegLab.API.Services.Interfaces;

namespace CyberStegLab.API.Services.Implementation;

public class LessonService : ILessonService
{
    private readonly FirestoreDb _db;

    public LessonService(FirestoreDb db) => _db = db;

    // ყველა lesson-ის სია, order-ის მიხედვით დალაგებული
    public async Task<List<object>> GetAllAsync()
    {
        var snapshot = await _db.Collection("lessons")
            .OrderBy("order")
            .GetSnapshotAsync();

        return snapshot.Documents.Select(MapDoc).ToList<object>();
    }

    // კონკრეტული lesson-ის მიღება ID-ით
    public async Task<object?> GetByIdAsync(string id)
    {
        var doc = await _db.Collection("lessons").Document(id).GetSnapshotAsync();
        return doc.Exists ? MapDoc(doc) : null;
    }

    // ახალი lesson-ის შექმნა Firestore-ში
    public async Task CreateAsync(CreateLessonRequest req)
    {
        var data = new Dictionary<string, object>
        {
            { "title",     req.Title },
            { "content",   req.Content },
            { "badge",     req.Badge },
            { "order",     req.Order },
            { "createdAt", Timestamp.FromDateTime(DateTime.UtcNow) }
        };
        await _db.Collection("lessons").AddAsync(data);
    }

    // არსებული lesson-ის ველების განახლება (merge-ით)
    public async Task UpdateAsync(string id, UpdateLessonRequest req)
    {
        var data = new Dictionary<string, object>
        {
            { "title",   req.Title },
            { "content", req.Content },
            { "badge",   req.Badge },
            { "order",   req.Order }
        };
        await _db.Collection("lessons").Document(id).SetAsync(data, SetOptions.MergeAll);
    }

    // lesson-ის წაშლა ID-ით
    public async Task DeleteAsync(string id)
    {
        await _db.Collection("lessons").Document(id).DeleteAsync();
    }

    // Firestore დოკუმენტის გარდაქმნა object-ად (client-ისთვის დასაბრუნებელი ფორმატი)
    private static object MapDoc(DocumentSnapshot doc) => new
    {
        id = doc.Id,
        title = doc.GetValue<string>("title"),
        content = doc.GetValue<string>("content"),
        badge = doc.GetValue<string>("badge"),
        order = doc.GetValue<int>("order")
    };
}