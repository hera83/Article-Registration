using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArticleRegistration.Api.Data.Configurations;

public sealed class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tags");
        builder.HasKey(tag => tag.Id);
        builder.Property(tag => tag.Name).HasMaxLength(50).IsRequired();
        builder.HasIndex(tag => tag.Name).IsUnique();
    }
}