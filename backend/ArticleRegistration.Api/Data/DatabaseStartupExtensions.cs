using Microsoft.EntityFrameworkCore;

namespace ArticleRegistration.Api.Data;

public static class DatabaseStartupExtensions
{
    public static async Task ApplyDatabaseMigrationsAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseStartup");
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        logger.LogInformation("Applying SQLite migrations.");
        await dbContext.Database.MigrateAsync();
        logger.LogInformation("SQLite migrations applied successfully.");
    }
}