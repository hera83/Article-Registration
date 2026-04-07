using ArticleRegistration.Api.Contracts;
using ArticleRegistration.Api.Data;
using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace ArticleRegistration.Api.Services;

public sealed class LookupService(AppDbContext dbContext, ILogger<LookupService> logger) : ILookupService
{
    public async Task<IReadOnlyList<AreaDto>> GetAreasAsync(CancellationToken cancellationToken)
    {
        var areas = await dbContext.Areas
            .AsNoTracking()
            .OrderBy(area => area.SortOrder)
            .ThenBy(area => area.Name)
            .Select(area => new AreaDto(area.Id, area.Name, area.SortOrder))
            .ToListAsync(cancellationToken);

        return areas;
    }

    public async Task<IReadOnlyList<TagDto>> GetTagsAsync(string? query, CancellationToken cancellationToken)
    {
        var normalizedQuery = query?.Trim().ToLowerInvariant();

        var tagsQuery = dbContext.Tags
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(normalizedQuery))
        {
            var term = $"%{normalizedQuery}%";
            tagsQuery = tagsQuery.Where(tag => EF.Functions.Like(tag.Name, term));
        }

        var tags = await tagsQuery
            .OrderBy(tag => tag.Name)
            .Select(tag => new TagDto(tag.Id, tag.Name))
            .ToListAsync(cancellationToken);

        return tags;
    }

    public async Task<AreaDto> CreateAreaAsync(CreateAreaRequest request, CancellationToken cancellationToken)
    {
        var normalizedName = NormalizeRequiredName(request.Name, 80, "Area name");
        var lookup = normalizedName.ToLowerInvariant();

        var existingArea = await dbContext.Areas
            .FirstOrDefaultAsync(area => area.Name.ToLower() == lookup, cancellationToken);

        if (existingArea is not null)
        {
            return new AreaDto(existingArea.Id, existingArea.Name, existingArea.SortOrder);
        }

        var nextSortOrder = await dbContext.Areas
            .OrderByDescending(area => area.SortOrder)
            .Select(area => area.SortOrder)
            .FirstOrDefaultAsync(cancellationToken);

        var area = new Area
        {
            Name = normalizedName,
            SortOrder = nextSortOrder + 10
        };

        dbContext.Areas.Add(area);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Created area '{AreaName}'.", area.Name);

        return new AreaDto(area.Id, area.Name, area.SortOrder);
    }

    public async Task<TagDto> CreateTagAsync(CreateTagRequest request, CancellationToken cancellationToken)
    {
        var normalizedName = NormalizeRequiredName(request.Name, 50, "Tag name").ToLowerInvariant();

        var existingTag = await dbContext.Tags
            .FirstOrDefaultAsync(tag => tag.Name.ToLower() == normalizedName, cancellationToken);

        if (existingTag is not null)
        {
            return new TagDto(existingTag.Id, existingTag.Name);
        }

        var tag = new Tag
        {
            Name = normalizedName
        };

        dbContext.Tags.Add(tag);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Created tag '{TagName}'.", tag.Name);

        return new TagDto(tag.Id, tag.Name);
    }

    private static string NormalizeRequiredName(string? value, int maxLength, string displayName)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new InvalidOperationException($"{displayName} is required.");
        }

        return normalized.Length > maxLength ? normalized[..maxLength] : normalized;
    }
}