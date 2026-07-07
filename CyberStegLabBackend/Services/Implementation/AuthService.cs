using System.Text;
using System.Text.Json;
using Google.Cloud.Firestore;

namespace CyberStegLab.API.Services;
// ავთენტიფიკაციის სერვისი - Firebase Identity Toolkit REST API-ის საშუალებით რეგისტრაცია
// და შესვლა, რეგისტრაციისას მომხმარებლის ჩაწერა Firestore-ში

public class AuthService : IAuthService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly FirestoreDb _db;

    public AuthService(IConfiguration config, FirestoreDb db)
    {
        _http = new HttpClient();
        _apiKey = config["Firebase:ApiKey"]!;
        _db = db;
    }

    public async Task<(bool Success, string Result)> RegisterAsync(string email, string password, string username = "")
    {
        var payload = JsonSerializer.Serialize(new { email, password, returnSecureToken = true });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync(
            $"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={_apiKey}",
            content
        );

        var result = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            var json = JsonSerializer.Deserialize<JsonElement>(result);
            var uid = json.GetProperty("localId").GetString();

            await _db.Collection("users").Document(uid).SetAsync(new Dictionary<string, object>
        {
            { "uid",      uid },
            { "email",    email },
            { "username", string.IsNullOrEmpty(username) ? email.Split('@')[0] : username }
        });
        }

        return (response.IsSuccessStatusCode, result);
    }

    public async Task<(bool Success, string Result)> LoginAsync(string email, string password)
    {
        var payload = JsonSerializer.Serialize(new { email, password, returnSecureToken = true });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync(
            $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={_apiKey}",
            content
        );

        var result = await response.Content.ReadAsStringAsync();
        return (response.IsSuccessStatusCode, result);
    }
}