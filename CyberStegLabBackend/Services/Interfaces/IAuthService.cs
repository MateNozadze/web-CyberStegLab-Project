namespace CyberStegLab.API.Services;

public interface IAuthService
{
    Task<(bool Success, string Result)> RegisterAsync(string email, string password, string username = "");
    Task<(bool Success, string Result)> LoginAsync(string email, string password);
}
