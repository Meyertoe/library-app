using System.ComponentModel.DataAnnotations;

namespace Library.Api.DTOs;

public class QuoteRequest
{
    [Required, StringLength(2000)]
    public string Text { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Author { get; set; } = string.Empty;
}

public record QuoteResponse(int Id, string Text, string Author);
