using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;

namespace CyberStegLab.API.Data;

// Firebase Auth-ის მომხმარებლების სინქრონიზაცია Firestore-ის "users" კოლექციასთან
// თუ Firestore-ში მომხმარებლის დოკუმენტი არ არსებობს, ქმნის ახალს

public static class UserSeeder
{
    public static async Task SeedAsync(FirestoreDb db)
    {
        var pagedEnumerable = FirebaseAuth.DefaultInstance.ListUsersAsync(null);
        var enumerator = pagedEnumerable.GetAsyncEnumerator();

        while (await enumerator.MoveNextAsync())
        {
            var user = enumerator.Current;
            var doc = await db.Collection("users").Document(user.Uid).GetSnapshotAsync();
            if (doc.Exists) continue;

            await db.Collection("users").Document(user.Uid).SetAsync(new Dictionary<string, object>
            {
                { "uid",      user.Uid },
                { "email",    user.Email ?? "" },
                { "username", user.Email?.Split('@')[0] ?? user.Uid }
            });
        }
    }
}