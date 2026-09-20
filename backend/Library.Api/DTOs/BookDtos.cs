using System.ComponentModel.DataAnnotations;

namespace Library.Api.DTOs;

public class BookRequest
{
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Author { get; set; } = string.Empty;

    // Nullable lets validation distinguish a missing date from a supplied date.
    [Required]
    public DateOnly? PublicationDate { get; set; }
}

public record BookResponse(int Id, string Title, string Author, DateOnly PublicationDate);
