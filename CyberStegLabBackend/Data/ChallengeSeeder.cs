using Google.Cloud.Firestore;

namespace CyberStegLab.API.Data;
// Challenge-ების საწყისი მონაცემებით შევსება
// თუ ბაზა ცარიელია, ამატებს საწყის challenge-ებს (LSB, Base64, quiz)
public static class ChallengeSeeder
{
    public static async Task SeedAsync(FirestoreDb db)
    {
        var challenges = db.Collection("challenges");
        var snapshot = await challenges.GetSnapshotAsync();

        if (snapshot.Documents.Count > 0)
            return;

        var data = new List<Dictionary<string, object>>
        {
            new()
            {
                { "title",         "LSB Decoder" },
                { "description",   "სურათში დამალულია შეტყობინება LSB სტეგანოგრაფიის გამოყენებით. გამოიყენე Python Pillow ან stegonline.georgeom.net და ამოიღე დამალული flag." },
                { "difficulty",    "beginner" },
                { "type",          "stego" },
                { "xp",            50 },
                { "correctAnswer", "FLAG{lsb_master}" },
                { "imagePath",     "/img/lsb.png" }
            },
            new()
            {
                { "title",         "Base64 Secrets" },
                { "description",   "სურათში LSB-ით დამალულია Base64 კოდირებული შეტყობინება. ჯერ LSB-ით ამოიღე, შემდეგ Base64 გაშიფრე და იპოვე flag." },
                { "difficulty",    "beginner" },
                { "type",          "stego" },
                { "xp",            80 },
                { "correctAnswer", "FLAG{base64_stego}" },
                { "imagePath",     "/img/base64.png" }
            },
            new()
            {
                { "title",         "Stego Quiz" },
                { "description",   "შეამოწმე შენი ცოდნა სტეგანოგრაფიაში. აირჩიე სწორი პასუხი." },
                { "difficulty",    "beginner" },
                { "type",          "quiz" },
                { "xp",            30 },
                { "correctAnswer", "LSB" },
                { "imagePath",     "" },
                { "question",      "რომელი მეთოდი მალავს ინფორმაციას პიქსელის ყველაზე ნაკლებმნიშვნელოვან ბიტში?" },
                { "options",       new List<string> { "LSB", "Base64", "XOR", "RGB" } }
            },
        };

        foreach (var item in data)
            await challenges.AddAsync(item);
    }
}