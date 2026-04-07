namespace ArticleRegistration.Api.Domain;

public sealed class Article
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    public ArticleType ArticleType { get; private set; } = ArticleType.Standard;
    public Guid AreaId { get; private set; }
    public Area Area { get; private set; } = null!;
    public string? Note { get; private set; }
    public string? Brand { get; private set; }
    public string? Model { get; private set; }
    public string? Unit { get; private set; }
    public decimal? Quantity { get; private set; }
    public bool IsOnShoppingList { get; private set; }
    public string? ShoppingNote { get; private set; }
    public ArticleStatus Status { get; private set; } = ArticleStatus.Active;
    public string? TypicalLocation { get; private set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; private set; } = DateTime.UtcNow;
    public ICollection<ArticleTag> ArticleTags { get; } = [];

    public void UpdateDetails(
        string name,
        ArticleType articleType,
        Area area,
        string? note,
        string? brand,
        string? model,
        string? unit,
        decimal? quantity,
        bool isOnShoppingList,
        string? shoppingNote,
        ArticleStatus status,
        string? typicalLocation)
    {
        Name = name;
        ArticleType = articleType;
        Area = area;
        AreaId = area.Id;
        Note = note;
        Brand = brand;
        Model = model;
        Unit = unit;
        Quantity = quantity;
        IsOnShoppingList = isOnShoppingList;
        ShoppingNote = shoppingNote;
        Status = status;
        TypicalLocation = typicalLocation;

        NormalizeInventoryRules();
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ReplaceTags(IEnumerable<Tag> tags)
    {
        var distinctTags = tags
            .DistinctBy(tag => tag.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        ArticleTags.Clear();

        foreach (var tag in distinctTags)
        {
            ArticleTags.Add(new ArticleTag
            {
                Article = this,
                ArticleId = Id,
                Tag = tag,
                TagId = tag.Id
            });
        }

        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateQuantity(decimal quantity)
    {
        if (ArticleType != ArticleType.Stock)
        {
            throw new InvalidOperationException("Only stock articles can have quantity.");
        }

        if (quantity < 0)
        {
            throw new InvalidOperationException("Quantity cannot be negative.");
        }

        Quantity = decimal.Round(quantity, 2);

        if (Quantity > 0)
        {
            IsOnShoppingList = false;
            ShoppingNote = null;
        }

        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetShoppingListStatus(bool isOnShoppingList, string? shoppingNote)
    {
        IsOnShoppingList = isOnShoppingList;
        ShoppingNote = isOnShoppingList ? shoppingNote : null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void CompletePurchase(decimal quantity)
    {
        UpdateQuantity(quantity);
        IsOnShoppingList = false;
        ShoppingNote = null;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetStatus(ArticleStatus status)
    {
        Status = status;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void SetOutOfStock()
    {
        if (ArticleType != ArticleType.Stock)
        {
            throw new InvalidOperationException("Only stock articles can be set out of stock.");
        }

        Quantity = 0;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    internal void LoadSeedState(
        Guid id,
        string name,
        ArticleType articleType,
        Guid areaId,
        string? note,
        string? brand,
        string? model,
        string? unit,
        decimal? quantity,
        bool isOnShoppingList,
        string? shoppingNote,
        ArticleStatus status,
        string? typicalLocation,
        DateTime createdAtUtc,
        DateTime updatedAtUtc)
    {
        Id = id;
        Name = name;
        ArticleType = articleType;
        AreaId = areaId;
        Note = note;
        Brand = brand;
        Model = model;
        Unit = unit;
        Quantity = quantity;
        IsOnShoppingList = isOnShoppingList;
        ShoppingNote = shoppingNote;
        Status = status;
        TypicalLocation = typicalLocation;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = updatedAtUtc;

        NormalizeInventoryRules();
        UpdatedAtUtc = updatedAtUtc;
    }

    // V1 rule: standard articles do not track inventory, stock articles do.
    private void NormalizeInventoryRules()
    {
        if (ArticleType == ArticleType.Standard)
        {
            Quantity = null;
            Unit = null;
            return;
        }

        if (Quantity is null)
        {
            Quantity = 0;
        }

        if (Quantity < 0)
        {
            throw new InvalidOperationException("Quantity cannot be negative.");
        }

        Quantity = decimal.Round(Quantity.Value, 2);

        if (Quantity > 0)
        {
            IsOnShoppingList = false;
            ShoppingNote = null;
        }
    }
}