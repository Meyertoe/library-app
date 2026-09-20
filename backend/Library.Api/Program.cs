using System.Text;
using Library.Api.Data;
using Library.Api.Models;
using Library.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// Explicit maintenance mode; migrations never run during normal web startup.
var migrateOnly = args.Contains("--migrate");
var builder = WebApplication.CreateBuilder(args.Where(arg => arg != "--migrate").ToArray());

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<TokenService>();

var jwt = builder.Configuration.GetSection("Jwt");
var signingKey = jwt["Key"] ?? throw new InvalidOperationException("Jwt:Key saknas. Sätt Jwt:Key med dotnet user-secrets lokalt eller Jwt__Key i driftmiljön. Se README.");
if (Encoding.UTF8.GetByteCount(signingKey) < 32 ||
    string.IsNullOrWhiteSpace(jwt["Issuer"]) ||
    string.IsNullOrWhiteSpace(jwt["Audience"]) || jwt.GetValue<int>("ExpiresMinutes") <= 0)
    throw new InvalidOperationException("JWT-inställningarna är ogiltiga.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            NameClaimType = "username",
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (migrateOnly)
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
    return;
}

// The production package serves Angular and the API on the same origin.
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
// Unknown API URLs must stay API 404s, never return Angular's index.html.
app.Map("/api/{**path}", () => Results.NotFound());
app.MapFallbackToFile("index.html");

app.Run();
