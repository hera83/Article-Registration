using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArticleRegistration.Api.Data.Configurations;

public sealed class AreaConfiguration : IEntityTypeConfiguration<Area>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.ToTable("Areas");
        builder.HasKey(area => area.Id);
        builder.Property(area => area.Name).HasMaxLength(80).IsRequired();
        builder.Property(area => area.SortOrder).IsRequired();
        builder.HasIndex(area => area.Name).IsUnique();
    }
}