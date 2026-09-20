using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Library.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Quotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Text = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    Author = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_UserId",
                table: "Quotes",
                column: "UserId");

            // Backfill existing users once. New registrations are handled by InitialQuotes.
            migrationBuilder.Sql("""
                WITH InitialQuotes(Text, Author) AS (
                    VALUES
                        ('To be, or not to be, that is the question.', 'William Shakespeare'),
                        ('Brevity is the soul of wit.', 'William Shakespeare'),
                        ('The rest is silence.', 'William Shakespeare'),
                        ('All the world''s a stage.', 'William Shakespeare'),
                        ('What''s in a name?', 'William Shakespeare')
                )
                INSERT INTO Quotes (Text, Author, UserId)
                SELECT initial.Text, initial.Author, users.Id
                FROM Users AS users CROSS JOIN InitialQuotes AS initial
                WHERE NOT EXISTS (SELECT 1 FROM Quotes WHERE UserId = users.Id);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Quotes");
        }
    }
}
