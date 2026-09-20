using System.ComponentModel.DataAnnotations;

namespace Library.Api.DTOs;

public class RegisterRequest
{
    [Required, StringLength(30, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9_.-]+$")]
    public string Username { get; set; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, StringLength(30)]
    public string Username { get; set; } = string.Empty;

    [Required, StringLength(128)]
    public string Password { get; set; } = string.Empty;
}

public record AuthResponse(string Token, string Username);
