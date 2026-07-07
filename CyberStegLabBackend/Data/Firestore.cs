using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;

namespace CyberStegLab.API.Data;

// Firestore-ის და Firebase Admin SDK-ის ინიციალიზაცია
// credential ფაილიდან ავთენტიფიცირებული FirestoreDb ინსტანციის შექმნა
public static class FirestoreInitializer
{
    public static async Task<FirestoreDb> InitializeAsync(string projectId, string credentialPath)
    {
        // 🛠️ Google-ის ახალი და ყველაზე მარტივი სტანდარტი Stream-ით წასაკითხად
        using var stream = new FileStream(credentialPath, FileMode.Open, FileAccess.Read);
        var googleCredential = GoogleCredential.FromStream(stream);

        FirebaseApp.Create(new AppOptions
        {
            Credential = googleCredential
        });

        return await new FirestoreDbBuilder
        {
            ProjectId = projectId,
            Credential = googleCredential
        }.BuildAsync();
    }
}