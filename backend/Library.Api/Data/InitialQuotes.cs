using Library.Api.Models;

namespace Library.Api.Data;

public static class InitialQuotes
{
    // Short excerpts from Shakespeare's public-domain plays, in their original language.
    // Return new entities for each user; they can edit/delete them independently.
    public static List<Quote> Create() =>
    [
        new() { Text = "To be, or not to be, that is the question.", Author = "William Shakespeare" },
        new() { Text = "Brevity is the soul of wit.", Author = "William Shakespeare" },
        new() { Text = "The rest is silence.", Author = "William Shakespeare" },
        new() { Text = "All the world's a stage.", Author = "William Shakespeare" },
        new() { Text = "What's in a name?", Author = "William Shakespeare" }
    ];
}
