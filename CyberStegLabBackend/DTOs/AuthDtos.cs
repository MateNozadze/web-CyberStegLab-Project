namespace CyberStegLab.API.DTOs;

// მომხმარებლის რეგისტრაციისა და შესვლის მოთხოვნების DTO-ები
public record RegisterRequest(string Email, string Password, string Username = ""); 
public record LoginRequest(string Email, string Password);
