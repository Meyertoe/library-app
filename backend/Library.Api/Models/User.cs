namespace Library.Api.Models;

public class User
{
    public List<Quote> Quotes { get; set; } = [];
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}
