using Google.Cloud.Firestore;

namespace CyberStegLab.API.Data;

// Achievement-ების საწყისი მონაცემებით შევსება
// თუ კოლექცია ცარიელია, ამატებს 6 წინასწარგანსაზღვრულ achievement-ს XP ზღვრებით
public static class AchievementSeeder
{
    public static async Task SeedAsync(FirestoreDb db)
    {
        var collection = db.Collection("achievements");
        var snapshot = await collection.GetSnapshotAsync();

        if (snapshot.Documents.Count > 0)
            return;

        var data = new List<Dictionary<string, object>>
        {
            new() { { "title", "პირველი ნაბიჯი" },  { "description", "მიაღწიე 100 XP"   }, { "icon", "🌱" }, { "requiredXP", 100   } },
            new() { { "title", "დამწყები"        },  { "description", "მიაღწიე 500 XP"   }, { "icon", "⚡" }, { "requiredXP", 500   } },
            new() { { "title", "გამოცდილი"       },  { "description", "მიაღწიე 1000 XP"  }, { "icon", "🔥" }, { "requiredXP", 1000  } },
            new() { { "title", "პროფესიონალი"    },  { "description", "მიაღწიე 2500 XP"  }, { "icon", "💎" }, { "requiredXP", 2500  } },
            new() { { "title", "ექსპერტი"        },  { "description", "მიაღწიე 5000 XP"  }, { "icon", "🛡️" }, { "requiredXP", 5000  } },
            new() { { "title", "მასტერი"         },  { "description", "მიაღწიე 10000 XP" }, { "icon", "👑" }, { "requiredXP", 10000 } }
        };

        foreach (var item in data)
            await collection.AddAsync(item);
    }
}