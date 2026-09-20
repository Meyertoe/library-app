using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Library.Api.Data;
using Library.Api.DTOs;
using Library.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Library.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/quotes")]
public class QuotesController(AppDbContext db) : ControllerBase
{
    // Authentication validates the token; its subject identifies the owner.
    private int CurrentUserId => int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    [HttpGet]
    public async Task<ActionResult<List<QuoteResponse>>> GetAll()
    {
        return await db.Quotes.AsNoTracking()
            .Where(quote => quote.UserId == CurrentUserId)
            .OrderBy(quote => quote.Id)
            .Select(quote => new QuoteResponse(quote.Id, quote.Text, quote.Author))
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> GetById(int id)
    {
        var quote = await db.Quotes.AsNoTracking()
            .SingleOrDefaultAsync(quote => quote.Id == id && quote.UserId == CurrentUserId);
        if (quote is null) return NotFound();
        return Ok(new QuoteResponse(quote.Id, quote.Text, quote.Author));
    }

    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> Create(QuoteRequest request)
    {
        var quote = new Quote
        {
            Text = request.Text.Trim(),
            Author = request.Author.Trim(),
            UserId = CurrentUserId
        };
        db.Quotes.Add(quote);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = quote.Id },
            new QuoteResponse(quote.Id, quote.Text, quote.Author));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, QuoteRequest request)
    {
        var quote = await db.Quotes.SingleOrDefaultAsync(
            quote => quote.Id == id && quote.UserId == CurrentUserId);
        if (quote is null) return NotFound();
        quote.Text = request.Text.Trim();
        quote.Author = request.Author.Trim();
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var quote = await db.Quotes.SingleOrDefaultAsync(
            quote => quote.Id == id && quote.UserId == CurrentUserId);
        if (quote is null) return NotFound();
        db.Quotes.Remove(quote);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
