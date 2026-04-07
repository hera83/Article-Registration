namespace ArticleRegistration.Api.Contracts;

public enum ArticleLifecycleFilter
{
    Active,
    Archived,
    All
}

public enum StockStatusFilter
{
    All,
    InStock,
    Empty
}

public sealed record ArticleSearchRequest(
    string? Query,
    string? ArticleType,
    string? Area,
    string? Tag,
    bool? OnShoppingList,
    ArticleLifecycleFilter Status = ArticleLifecycleFilter.Active,
    StockStatusFilter StockStatus = StockStatusFilter.All);

public sealed record ArticleDto(
    Guid Id,
    string Name,
    string ArticleType,
    string Area,
    string[] Tags,
    string? Note,
    string? Brand,
    string? Model,
    string? Unit,
    decimal? Quantity,
    bool IsOnShoppingList,
    string? ShoppingNote,
    bool IsArchived,
    string? TypicalLocation,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

public sealed record ShoppingListItemDto(
    Guid ArticleId,
    string Name,
    string Area,
    string[] Tags,
    string? Brand,
    string? Model,
    decimal? Quantity,
    string? Unit,
    string? ShoppingNote);

public sealed record ArticleUpsertRequest(
    string Name,
    string ArticleType,
    string Area,
    string[]? Tags,
    string? Note,
    string? Brand,
    string? Model,
    string? Unit,
    decimal? Quantity,
    bool IsOnShoppingList,
    string? ShoppingNote,
    bool IsArchived,
    string? TypicalLocation);

public sealed record QuantityUpdateRequest(decimal Quantity);

public sealed record ShoppingListUpdateRequest(bool IsOnShoppingList, string? ShoppingNote);

public sealed record CompletePurchaseRequest(decimal Quantity);

public sealed record ArchiveUpdateRequest(bool IsArchived);

public sealed record MarkForShoppingListRequest(string? ShoppingNote);

public sealed record RestockFromShoppingListRequest(decimal Quantity);

public sealed record RunOutRequest(string? ShoppingNote);