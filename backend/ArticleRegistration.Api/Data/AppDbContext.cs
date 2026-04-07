using ArticleRegistration.Api.Data.Configurations;
using ArticleRegistration.Api.Data.Seed;
using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace ArticleRegistration.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ArticleTag> ArticleTags => Set<ArticleTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new AreaConfiguration());
        modelBuilder.ApplyConfiguration(new TagConfiguration());
        modelBuilder.ApplyConfiguration(new ArticleConfiguration());
        modelBuilder.ApplyConfiguration(new ArticleTagConfiguration());

        modelBuilder.Entity<Area>().HasData(V1SeedData.Areas);
        modelBuilder.Entity<Tag>().HasData(V1SeedData.Tags);
        modelBuilder.Entity<Article>().HasData(V1SeedData.Articles);
        modelBuilder.Entity<ArticleTag>().HasData(V1SeedData.ArticleTags);
    }
}