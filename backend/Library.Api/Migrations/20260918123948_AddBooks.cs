using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Library.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBooks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Author = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PublicationDate = table.Column<DateOnly>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                });

            // The table has just been created and is empty. Seed only during this migration,
            // so deleting all books later does not cause them to reappear on server restart.
            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "Id", "Title", "Author", "PublicationDate" },
                values: new object[,]
                {
                    { 1, "1984", "George Orwell", new DateOnly(1949, 6, 8) },
                    { 2, "The Hobbit", "J.R.R. Tolkien", new DateOnly(1937, 9, 21) },
                    { 3, "Pride and Prejudice", "Jane Austen", new DateOnly(1813, 1, 28) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Books");
        }
    }
}
