using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArticleRegistration.Api.Data.Configurations;

public sealed class ArticleConfiguration : IEntityTypeConfiguration<Article>
{
    public void Configure(EntityTypeBuilder<Article> builder)
    {
        builder.ToTable("Articles");
        builder.HasKey(article => article.Id);

        builder.Property(article => article.Name).HasMaxLength(200).IsRequired();
        builder.Property(article => article.ArticleType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(article => article.Note).HasMaxLength(2000);
        builder.Property(article => article.Brand).HasMaxLength(100);
        builder.Property(article => article.Model).HasMaxLength(100);
        builder.Property(article => article.Unit).HasMaxLength(30);
        builder.Property(article => article.Quantity).HasPrecision(10, 2);
        builder.Property(article => article.ShoppingNote).HasMaxLength(500);
        builder.Property(article => article.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(article => article.TypicalLocation).HasMaxLength(150);
        builder.Property(article => article.CreatedAtUtc).IsRequired();
        builder.Property(article => article.UpdatedAtUtc).IsRequired();

        builder.HasOne(article => article.Area)
            .WithMany(area => area.Articles)
            .HasForeignKey(article => article.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(article => article.Name);
        builder.HasIndex(article => article.AreaId);
        builder.HasIndex(article => new { article.Status, article.IsOnShoppingList, article.ArticleType });
    }
}