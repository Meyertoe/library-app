using Library.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Library.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<Book> Books => Set<Book>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Quote>().Property(quote => quote.Text).IsRequired().HasMaxLength(2000);
        modelBuilder.Entity<Quote>().Property(quote => quote.Author).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Quote>().HasOne(quote => quote.User)
            .WithMany(user => user.Quotes).HasForeignKey(quote => quote.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Book>().Property(book => book.Title).IsRequired().HasMaxLength(200);
        modelBuilder.Entity<Book>().Property(book => book.Author).IsRequired().HasMaxLength(100);

        // Usernames contain ASCII letters, digits, dots, underscores or hyphens.
        // NOCASE makes both lookups and the unique index case-insensitive in SQLite.
        modelBuilder.Entity<User>().Property(user => user.Username)
            .IsRequired().HasMaxLength(30).UseCollation("NOCASE");
        modelBuilder.Entity<User>().HasIndex(user => user.Username).IsUnique();
        modelBuilder.Entity<User>().Property(user => user.PasswordHash).IsRequired();
    }
}
