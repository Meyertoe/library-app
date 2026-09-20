using Library.Api.Data;
using Library.Api.DTOs;
using Library.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Library.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/books")]
public class BooksController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BookResponse>>> GetAll()
    {
        return await db.Books.AsNoTracking()
            .OrderBy(book => book.Title).ThenBy(book => book.Id)
            .Select(book => new BookResponse(book.Id, book.Title, book.Author, book.PublicationDate))
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponse>> GetById(int id)
    {
        var book = await db.Books.AsNoTracking().SingleOrDefaultAsync(book => book.Id == id);
        if (book is null) return NotFound();

        return Ok(new BookResponse(book.Id, book.Title, book.Author, book.PublicationDate));
    }

    [HttpPost]
    public async Task<ActionResult<BookResponse>> Create(BookRequest request)
    {
        var book = new Book
        {
            Title = request.Title.Trim(),
            Author = request.Author.Trim(),
            PublicationDate = request.PublicationDate!.Value
        };
        db.Books.Add(book);
        await db.SaveChangesAsync();

        var response = new BookResponse(book.Id, book.Title, book.Author, book.PublicationDate);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, BookRequest request)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();

        book.Title = request.Title.Trim();
        book.Author = request.Author.Trim();
        book.PublicationDate = request.PublicationDate!.Value;
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var book = await db.Books.FindAsync(id);
        if (book is null) return NotFound();

        db.Books.Remove(book);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
