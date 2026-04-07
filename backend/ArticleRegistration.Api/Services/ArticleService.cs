using ArticleRegistration.Api.Contracts;
using ArticleRegistration.Api.Data;
using ArticleRegistration.Api.Domain;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ArticleRegistration.Api.Services;

public sealed class ArticleService(AppDbContext dbContext, ILogger<ArticleService> logger) : IArticleService
{
    public async Task<IReadOnlyList<ArticleDto>> SearchAsync(ArticleSearchRequest request, CancellationToken cancellationToken)
    {
        var normalizedQuery = request.Query?.Trim();
        var normalizedArea = request.Area?.Trim();
        var normalizedTag = request.Tag?.Trim();
        var parsedType = TryParseArticleType(request.ArticleType);
        var queryTokens = TokenizeQuery(normalizedQuery);

        var articlesQuery = dbContext.Articles
            .AsNoTracking()
            .Include(article => article.Area)
            .Include(article => article.ArticleTags)
            .ThenInclude(articleTag => articleTag.Tag)
            .AsQueryable();

        articlesQuery = request.Status switch
        {
            ArticleLifecycleFilter.Archived => articlesQuery.Where(article => article.Status == ArticleStatus.Archived),
            ArticleLifecycleFilter.All => articlesQuery,
            _ => articlesQuery.Where(article => article.Status == ArticleStatus.Active)
        };

        if (!string.IsNullOrWhiteSpace(normalizedArea))
        {
            var areaName = normalizedArea.ToLowerInvariant();
            articlesQuery = articlesQuery.Where(article => article.Area.Name.ToLower() == areaName);
        }

        if (parsedType is not null)
        {
            articlesQuery = articlesQuery.Where(article => article.ArticleType == parsedType);
        }

        if (!string.IsNullOrWhiteSpace(normalizedTag))
        {
            var tagName = normalizedTag.ToLowerInvariant();
            articlesQuery = articlesQuery.Where(article => article.ArticleTags.Any(articleTag => articleTag.Tag.Name.ToLower() == tagName));
        }

        if (request.OnShoppingList is not null)
        {
            articlesQuery = articlesQuery.Where(article => article.IsOnShoppingList == request.OnShoppingList.Value);
        }

        articlesQuery = request.StockStatus switch
        {
            StockStatusFilter.InStock => articlesQuery.Where(article => article.ArticleType != ArticleType.Stock || article.Quantity > 0),
            StockStatusFilter.Empty => articlesQuery.Where(article => article.ArticleType != ArticleType.Stock || article.Quantity == 0),
            _ => articlesQuery
        };

        if (parsedType == ArticleType.Standard && request.StockStatus != StockStatusFilter.All)
        {
            throw new InvalidOperationException("StockStatus filter only applies to stock articles.");
        }

        if (queryTokens.Count > 0)
        {
            foreach (var queryToken in queryTokens)
            {
                var term = $"%{queryToken}%";
                var compactTerm = $"%{CompactForSearch(queryToken)}%";

                articlesQuery = articlesQuery.Where(article =>
                    EF.Functions.Like(article.Name, term) ||
                    EF.Functions.Like(article.Name.Replace(" ", string.Empty).Replace("-", string.Empty).Replace("_", string.Empty), compactTerm) ||
                    article.ArticleTags.Any(articleTag => EF.Functions.Like(articleTag.Tag.Name, term)) ||
                    (article.Note != null && EF.Functions.Like(article.Note, term)) ||
                    (article.Brand != null && EF.Functions.Like(article.Brand, term)) ||
                    (article.Model != null && EF.Functions.Like(article.Model, term)) ||
                    EF.Functions.Like(((article.Brand ?? string.Empty) + (article.Model ?? string.Empty)).Replace(" ", string.Empty).Replace("-", string.Empty).Replace("_", string.Empty), compactTerm));
            }
        }

        var articles = await articlesQuery
            .OrderBy(article => article.Status)
            .ThenByDescending(article => article.IsOnShoppingList)
            .ThenBy(article => article.Name)
            .ToListAsync(cancellationToken);

        logger.LogDebug("Article search returned {Count} items for query '{Query}'.", articles.Count, normalizedQuery ?? string.Empty);

        return articles.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyList<ShoppingListItemDto>> GetShoppingListAsync(CancellationToken cancellationToken)
    {
        var articles = await dbContext.Articles
            .AsNoTracking()
            .Include(article => article.Area)
            .Include(article => article.ArticleTags)
            .ThenInclude(articleTag => articleTag.Tag)
            .Where(article => article.IsOnShoppingList && article.Status == ArticleStatus.Active)
            .OrderBy(article => article.Name)
            .ToListAsync(cancellationToken);

        return articles.Select(ToShoppingListItemDto).ToArray();
    }

    public async Task<ArticleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles
            .AsNoTracking()
            .Include(item => item.Area)
            .Include(item => item.ArticleTags)
            .ThenInclude(articleTag => articleTag.Tag)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        return article is null ? null : ToDto(article);
    }

    public async Task<ArticleDto> CreateAsync(ArticleUpsertRequest request, CancellationToken cancellationToken)
    {
        var area = await ResolveAreaAsync(request.Area, cancellationToken);
        var tags = await ResolveTagsAsync(request.Tags, cancellationToken);
        var article = new Article();

        Apply(article, request, area);
        article.ReplaceTags(tags);

        dbContext.Articles.Add(article);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Created article {ArticleId} with name '{ArticleName}'.", article.Id, article.Name);

        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> UpdateAsync(Guid id, ArticleUpsertRequest request, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles
            .Include(item => item.Area)
            .Include(item => item.ArticleTags)
            .ThenInclude(articleTag => articleTag.Tag)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        var area = await ResolveAreaAsync(request.Area, cancellationToken);
        var tags = await ResolveTagsAsync(request.Tags, cancellationToken);

        Apply(article, request, area);
        article.ReplaceTags(tags);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Updated article {ArticleId} with name '{ArticleName}'.", article.Id, article.Name);

        return ToDto(article);
    }

    public async Task<ArticleDto?> UpdateQuantityAsync(Guid id, decimal quantity, CancellationToken cancellationToken)
    {
        if (quantity < 0)
        {
            throw new InvalidOperationException("Quantity cannot be negative.");
        }

        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        article.UpdateQuantity(quantity);

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Updated quantity for article {ArticleId} to {Quantity}.", article.Id, quantity);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> AddToShoppingListAsync(Guid id, string? shoppingNote, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        EnsureStockArticle(article, "Only stock articles can be added to the shopping list.");
        article.SetShoppingListStatus(true, CleanOptional(shoppingNote, 500));

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Added article {ArticleId} to shopping list.", article.Id);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> RemoveFromShoppingListAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        EnsureStockArticle(article, "Only stock articles can be removed from the shopping list.");
        article.SetShoppingListStatus(false, null);

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Removed article {ArticleId} from shopping list.", article.Id);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> RestockFromShoppingListAsync(Guid id, decimal quantity, CancellationToken cancellationToken)
    {
        if (quantity < 0)
        {
            throw new InvalidOperationException("Quantity cannot be negative.");
        }

        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        EnsureStockArticle(article, "Only stock articles can be restocked from the shopping list.");
        article.CompletePurchase(quantity);

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Restocked article {ArticleId} with quantity {Quantity}.", article.Id, quantity);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> ArchiveAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        article.SetStatus(ArticleStatus.Archived);

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Archived article {ArticleId}.", article.Id);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> ReactivateAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        article.SetStatus(ArticleStatus.Active);

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Reactivated article {ArticleId}.", article.Id);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    public async Task<ArticleDto?> SetOutOfStockAsync(Guid id, string? shoppingNote, CancellationToken cancellationToken)
    {
        var article = await dbContext.Articles.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        EnsureStockArticle(article, "Only stock articles can be marked as out of stock.");
        article.SetOutOfStock();
        article.SetShoppingListStatus(true, CleanOptional(shoppingNote, 500));

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Marked article {ArticleId} as out of stock and added it to shopping list.", article.Id);
        await LoadReferencesAsync(article, cancellationToken);
        return ToDto(article);
    }

    private static void Apply(Article article, ArticleUpsertRequest request, Area area)
    {
        article.UpdateDetails(
            CleanRequired(request.Name, 200, nameof(request.Name)),
            ParseArticleType(request.ArticleType),
            area,
            CleanOptional(request.Note, 2000),
            CleanOptional(request.Brand, 100),
            CleanOptional(request.Model, 100),
            CleanOptional(request.Unit, 30),
            NormalizeQuantity(request.Quantity),
            request.IsOnShoppingList,
            request.IsOnShoppingList ? CleanOptional(request.ShoppingNote, 500) : null,
            request.IsArchived ? ArticleStatus.Archived : ArticleStatus.Active,
            CleanOptional(request.TypicalLocation, 150));
    }

    private static ArticleDto ToDto(Article article)
    {
        return new ArticleDto(
            article.Id,
            article.Name,
            ToApiValue(article.ArticleType),
            article.Area.Name,
            article.ArticleTags
                .OrderBy(articleTag => articleTag.Tag.Name)
                .Select(articleTag => articleTag.Tag.Name)
                .ToArray(),
            article.Note,
            article.Brand,
            article.Model,
            article.Unit,
            article.Quantity,
            article.IsOnShoppingList,
            article.ShoppingNote,
            article.Status == ArticleStatus.Archived,
            article.TypicalLocation,
            article.CreatedAtUtc,
            article.UpdatedAtUtc);
    }

    private static ShoppingListItemDto ToShoppingListItemDto(Article article)
    {
        return new ShoppingListItemDto(
            article.Id,
            article.Name,
            article.Area.Name,
            article.ArticleTags
                .OrderBy(articleTag => articleTag.Tag.Name)
                .Select(articleTag => articleTag.Tag.Name)
                .ToArray(),
            article.Brand,
            article.Model,
            article.Quantity,
            article.Unit,
            article.ShoppingNote);
    }

    private static string CleanRequired(string? value, int maxLength, string fieldName)
    {
        var normalized = value?.Trim();
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new InvalidOperationException($"{ToDisplayName(fieldName)} is required.");
        }

        return normalized.Length > maxLength ? normalized[..maxLength] : normalized;
    }

    private static string? CleanOptional(string? value, int maxLength)
    {
        var normalized = value?.Trim();
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return null;
        }

        return normalized.Length > maxLength ? normalized[..maxLength] : normalized;
    }

    private static IReadOnlyList<string> TokenizeQuery(string? value)
    {
        var normalized = value?.Trim();
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return [];
        }

        var tokens = Regex.Split(normalized, "[\\s,./\\\\|_:-]+")
            .Select(token => token.Trim())
            .Where(token => token.Length >= 2)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return tokens.Length > 0 ? tokens : [normalized];
    }

    private static string CompactForSearch(string value)
    {
        return Regex.Replace(value, "[\\s,./\\\\|_:-]+", string.Empty);
    }

    private static ArticleType ParseArticleType(string? value)
    {
        return TryParseArticleType(value)
            ?? throw new InvalidOperationException("Article type must be either 'standard' or 'stock'.");
    }

    private static ArticleType? TryParseArticleType(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "standard" => ArticleType.Standard,
            "common" => ArticleType.Standard,
            "stock" => ArticleType.Stock,
            _ => null
        };
    }

    private static string ToApiValue(ArticleType articleType)
    {
        return articleType switch
        {
            ArticleType.Stock => "stock",
            _ => "standard"
        };
    }

    private static void EnsureStockArticle(Article article, string errorMessage)
    {
        if (article.ArticleType != ArticleType.Stock)
        {
            throw new InvalidOperationException(errorMessage);
        }
    }

    private static decimal? NormalizeQuantity(decimal? quantity)
    {
        if (quantity is null)
        {
            return null;
        }

        if (quantity < 0)
        {
            throw new InvalidOperationException("Quantity cannot be negative.");
        }

        return decimal.Round(quantity.Value, 2);
    }

    private static string ToDisplayName(string fieldName)
    {
        return fieldName switch
        {
            nameof(ArticleUpsertRequest.Name) => "Name",
            nameof(ArticleUpsertRequest.Area) => "Area",
            _ => fieldName
        };
    }

    private async Task<Area> ResolveAreaAsync(string? areaName, CancellationToken cancellationToken)
    {
        var normalizedArea = CleanRequired(areaName, 80, nameof(ArticleUpsertRequest.Area));
        var areaLookup = normalizedArea.ToLowerInvariant();

        var existingArea = await dbContext.Areas
            .FirstOrDefaultAsync(area => area.Name.ToLower() == areaLookup, cancellationToken);

        if (existingArea is not null)
        {
            return existingArea;
        }

        var nextSortOrder = await dbContext.Areas
            .OrderByDescending(area => area.SortOrder)
            .Select(area => area.SortOrder)
            .FirstOrDefaultAsync(cancellationToken);

        var area = new Area
        {
            Name = normalizedArea,
            SortOrder = nextSortOrder + 10
        };

        dbContext.Areas.Add(area);
        logger.LogInformation("Created new area '{AreaName}' during article save.", area.Name);
        return area;
    }

    private async Task<IReadOnlyList<Tag>> ResolveTagsAsync(IEnumerable<string>? tags, CancellationToken cancellationToken)
    {
        var normalizedTags = tags?
            .Select(tag => CleanRequired(tag, 50, nameof(tags)))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray()
            ?? [];

        if (normalizedTags.Length == 0)
        {
            return [];
        }

        var lowered = normalizedTags.Select(tag => tag.ToLowerInvariant()).ToArray();

        var existingTags = await dbContext.Tags
            .Where(tag => lowered.Contains(tag.Name.ToLower()))
            .ToListAsync(cancellationToken);

        var existingTagNames = existingTags
            .Select(tag => tag.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var tagName in normalizedTags.Where(tagName => !existingTagNames.Contains(tagName)))
        {
            var tag = new Tag { Name = tagName.ToLowerInvariant() };
            dbContext.Tags.Add(tag);
            existingTags.Add(tag);
            logger.LogInformation("Created new tag '{TagName}' during article save.", tag.Name);
        }

        return existingTags;
    }

    private async Task LoadReferencesAsync(Article article, CancellationToken cancellationToken)
    {
        await dbContext.Entry(article).Reference(item => item.Area).LoadAsync(cancellationToken);
        await dbContext.Entry(article).Collection(item => item.ArticleTags).LoadAsync(cancellationToken);

        foreach (var articleTag in article.ArticleTags)
        {
            await dbContext.Entry(articleTag).Reference(item => item.Tag).LoadAsync(cancellationToken);
        }
    }
}