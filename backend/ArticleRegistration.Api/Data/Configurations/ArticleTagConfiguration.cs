using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArticleRegistration.Api.Data.Configurations;

public sealed class ArticleTagConfiguration : IEntityTypeConfiguration<ArticleTag>
{
    public void Configure(EntityTypeBuilder<ArticleTag> builder)
    {
        builder.ToTable("ArticleTags");
        builder.HasKey(articleTag => new { articleTag.ArticleId, articleTag.TagId });

        builder.HasOne(articleTag => articleTag.Article)
            .WithMany(article => article.ArticleTags)
            .HasForeignKey(articleTag => articleTag.ArticleId);

        builder.HasOne(articleTag => articleTag.Tag)
            .WithMany(tag => tag.ArticleTags)
            .HasForeignKey(articleTag => articleTag.TagId);

        builder.HasIndex(articleTag => articleTag.TagId);
    }
}