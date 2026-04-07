using ArticleRegistration.Api.Contracts;

namespace ArticleRegistration.Api.Services;

public interface IArticleService
{
    Task<IReadOnlyList<ArticleDto>> SearchAsync(ArticleSearchRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<ShoppingListItemDto>> GetShoppingListAsync(CancellationToken cancellationToken);
    Task<ArticleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ArticleDto> CreateAsync(ArticleUpsertRequest request, CancellationToken cancellationToken);
    Task<ArticleDto?> UpdateAsync(Guid id, ArticleUpsertRequest request, CancellationToken cancellationToken);
    Task<ArticleDto?> UpdateQuantityAsync(Guid id, decimal quantity, CancellationToken cancellationToken);
    Task<ArticleDto?> AddToShoppingListAsync(Guid id, string? shoppingNote, CancellationToken cancellationToken);
    Task<ArticleDto?> RemoveFromShoppingListAsync(Guid id, CancellationToken cancellationToken);
    Task<ArticleDto?> RestockFromShoppingListAsync(Guid id, decimal quantity, CancellationToken cancellationToken);
    Task<ArticleDto?> ArchiveAsync(Guid id, CancellationToken cancellationToken);
    Task<ArticleDto?> ReactivateAsync(Guid id, CancellationToken cancellationToken);
    Task<ArticleDto?> SetOutOfStockAsync(Guid id, string? shoppingNote, CancellationToken cancellationToken);
}