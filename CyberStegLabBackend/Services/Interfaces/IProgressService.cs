namespace CyberStegLab.API.Services.Interfaces;

public interface IProgressService
{
    Task<object> GetUserProgressAsync(string userId);
}
