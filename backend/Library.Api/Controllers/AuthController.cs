using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Library.Api.Data;
using Library.Api.DTOs;
using Library.Api.Models;
using Library.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Library.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext db,
    IPasswordHasher<User> passwordHasher,
    TokenService tokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(user => user.Username == request.Username))
            return Conflict(new { message = "Användarnamnet är redan upptaget." });

        // EF saves the user and their five quotes in one transaction.
        var user = new User { Username = request.Username, Quotes = InitialQuotes.Create() };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        db.Users.Add(user);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (
            exception.InnerException is SqliteException { SqliteExtendedErrorCode: 2067 })
        {
            // The unique index also handles two registrations arriving simultaneously.
            return Conflict(new { message = "Användarnamnet är redan upptaget." });
        }

        return StatusCode(StatusCodes.Status201Created,
            new { message = "Kontot har skapats. Du kan nu logga in." });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.SingleOrDefaultAsync(user => user.Username == request.Username);
        if (user is null)
            return Unauthorized(new { message = "Fel användarnamn eller lösenord." });

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Fel användarnamn eller lösenord." });

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            await db.SaveChangesAsync();
        }

        return Ok(new AuthResponse(tokenService.CreateToken(user), user.Username));
    }

    // Returns the authenticated identity without exposing password hashes.
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            id = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!),
            username = User.FindFirstValue("username")
        });
    }
}
