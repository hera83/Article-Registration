using ArticleRegistration.Api.Domain;

namespace ArticleRegistration.Api.Data.Seed;

public static class V1SeedData
{
    public static readonly Guid AreaItId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid AreaHomelabId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid AreaAutoId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid AreaWorkshopId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid AreaElectricalId = Guid.Parse("55555555-5555-5555-5555-555555555555");
    public static readonly Guid AreaPlumbingId = Guid.Parse("66666666-6666-6666-6666-666666666666");

    public static readonly Guid TagNetworkId = Guid.Parse("aaaaaaaa-1111-1111-1111-111111111111");
    public static readonly Guid TagCat6Id = Guid.Parse("aaaaaaaa-2222-2222-2222-222222222222");
    public static readonly Guid TagRj45Id = Guid.Parse("aaaaaaaa-3333-3333-3333-333333333333");
    public static readonly Guid TagHomelabId = Guid.Parse("aaaaaaaa-4444-4444-4444-444444444444");
    public static readonly Guid TagServerId = Guid.Parse("aaaaaaaa-5555-5555-5555-555555555555");
    public static readonly Guid TagStorageId = Guid.Parse("aaaaaaaa-6666-6666-6666-666666666666");
    public static readonly Guid TagOilId = Guid.Parse("aaaaaaaa-7777-7777-7777-777777777777");
    public static readonly Guid TagRenaultId = Guid.Parse("aaaaaaaa-8888-8888-8888-888888888888");
    public static readonly Guid TagToolId = Guid.Parse("aaaaaaaa-9999-9999-9999-999999999999");
    public static readonly Guid TagElectricalId = Guid.Parse("bbbbbbbb-1111-1111-1111-111111111111");
    public static readonly Guid TagPlumbingId = Guid.Parse("bbbbbbbb-2222-2222-2222-222222222222");
    public static readonly Guid TagConsumableId = Guid.Parse("bbbbbbbb-3333-3333-3333-333333333333");

    public static readonly Guid ArticleRj45Id = Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid ArticlePatchCableId = Guid.Parse("10000000-0000-0000-0000-000000000002");
    public static readonly Guid ArticleOptiplexId = Guid.Parse("10000000-0000-0000-0000-000000000003");
    public static readonly Guid ArticleSsdId = Guid.Parse("10000000-0000-0000-0000-000000000004");
    public static readonly Guid ArticleOilId = Guid.Parse("10000000-0000-0000-0000-000000000005");
    public static readonly Guid ArticleWheelsId = Guid.Parse("10000000-0000-0000-0000-000000000006");
    public static readonly Guid ArticleTorxId = Guid.Parse("10000000-0000-0000-0000-000000000007");
    public static readonly Guid ArticleDriverId = Guid.Parse("10000000-0000-0000-0000-000000000008");
    public static readonly Guid ArticleWagoId = Guid.Parse("10000000-0000-0000-0000-000000000009");
    public static readonly Guid ArticlePtfeId = Guid.Parse("10000000-0000-0000-0000-000000000010");

    public static IReadOnlyCollection<Area> Areas =>
    [
        new Area { Id = AreaItId, Name = "IT", SortOrder = 10 },
        new Area { Id = AreaHomelabId, Name = "Homelab", SortOrder = 20 },
        new Area { Id = AreaAutoId, Name = "Auto", SortOrder = 30 },
        new Area { Id = AreaWorkshopId, Name = "Vaerksted", SortOrder = 40 },
        new Area { Id = AreaElectricalId, Name = "El", SortOrder = 50 },
        new Area { Id = AreaPlumbingId, Name = "VVS", SortOrder = 60 }
    ];

    public static IReadOnlyCollection<Tag> Tags =>
    [
        new Tag { Id = TagNetworkId, Name = "netvaerk" },
        new Tag { Id = TagCat6Id, Name = "cat6" },
        new Tag { Id = TagRj45Id, Name = "rj45" },
        new Tag { Id = TagHomelabId, Name = "homelab" },
        new Tag { Id = TagServerId, Name = "server" },
        new Tag { Id = TagStorageId, Name = "storage" },
        new Tag { Id = TagOilId, Name = "olie" },
        new Tag { Id = TagRenaultId, Name = "renault" },
        new Tag { Id = TagToolId, Name = "vaerktoej" },
        new Tag { Id = TagElectricalId, Name = "el" },
        new Tag { Id = TagPlumbingId, Name = "vvs" },
        new Tag { Id = TagConsumableId, Name = "forbrug" }
    ];

    public static IReadOnlyCollection<Article> Articles => new Article[]
    {
        new(),
        new(),
        new(),
        new(),
        new(),
        new(),
        new(),
        new(),
        new(),
        new()
    }
    .Select((article, index) => SeedArticle(article, index))
    .ToArray();

    public static IReadOnlyCollection<ArticleTag> ArticleTags =>
    [
        Link(ArticleRj45Id, TagNetworkId),
        Link(ArticleRj45Id, TagCat6Id),
        Link(ArticleRj45Id, TagRj45Id),
        Link(ArticleRj45Id, TagConsumableId),

        Link(ArticlePatchCableId, TagNetworkId),
        Link(ArticlePatchCableId, TagCat6Id),

        Link(ArticleOptiplexId, TagHomelabId),
        Link(ArticleOptiplexId, TagServerId),

        Link(ArticleSsdId, TagHomelabId),
        Link(ArticleSsdId, TagServerId),
        Link(ArticleSsdId, TagStorageId),

        Link(ArticleOilId, TagOilId),
        Link(ArticleOilId, TagRenaultId),
        Link(ArticleOilId, TagConsumableId),

        Link(ArticleWheelsId, TagRenaultId),

        Link(ArticleTorxId, TagToolId),
        Link(ArticleTorxId, TagConsumableId),

        Link(ArticleDriverId, TagToolId),

        Link(ArticleWagoId, TagElectricalId),
        Link(ArticleWagoId, TagConsumableId),

        Link(ArticlePtfeId, TagPlumbingId),
        Link(ArticlePtfeId, TagConsumableId)
    ];

    private static Article SeedArticle(Article article, int index)
    {
        var timestamp = new DateTime(2026, 01, 01, 12, 0, 0, DateTimeKind.Utc).AddDays(index);

        return index switch
        {
            0 => ConfigureSeedArticle(article, ArticleRj45Id, "RJ45 stik CAT6", ArticleType.Stock, AreaItId, "Pose med stik til terminering af kabler.", null, null, "stk", 0, true, "Koeb ny pose med mindst 25 stk", ArticleStatus.Active, "Sortimentskasse A3", timestamp),
            1 => ConfigureSeedArticle(article, ArticlePatchCableId, "Patchkabel CAT6 0.5m", ArticleType.Stock, AreaItId, null, null, null, "stk", 6, false, null, ArticleStatus.Active, "Kabelkasse", timestamp),
            2 => ConfigureSeedArticle(article, ArticleOptiplexId, "Dell OptiPlex 7070 Micro", ArticleType.Standard, AreaHomelabId, "Bruges som Proxmox node i homelab.", "Dell", "OptiPlex 7070 Micro", null, null, false, null, ArticleStatus.Active, "Rack hylde 2", timestamp),
            3 => ConfigureSeedArticle(article, ArticleSsdId, "Samsung PM883 1.92TB SSD", ArticleType.Stock, AreaHomelabId, "Ekstra SSD til homelab og testservere.", "Samsung", "PM883", "stk", 2, false, null, ArticleStatus.Active, "ESD kasse", timestamp),
            4 => ConfigureSeedArticle(article, ArticleOilId, "Motorolie 5W-30 5L", ArticleType.Stock, AreaAutoId, "Passer til Renault Kadjar 1.3 TCe.", null, null, "dunk", 0, true, "Husk OEM-specifikation RN17", ArticleStatus.Active, "Garagehylde", timestamp),
            5 => ConfigureSeedArticle(article, ArticleWheelsId, "Renault Kadjar alufaelge 17 tommer", ArticleType.Standard, AreaAutoId, "Originalt sommerhjulsaet.", "Renault", "17 tommer", null, null, false, null, ArticleStatus.Active, "Garageloft", timestamp),
            6 => ConfigureSeedArticle(article, ArticleTorxId, "Torx bits T20", ArticleType.Stock, AreaWorkshopId, "Loese bits til hurtig udskiftning.", null, null, "stk", 4, false, null, ArticleStatus.Active, "Bitskuffe", timestamp),
            7 => ConfigureSeedArticle(article, ArticleDriverId, "Milwaukee M12 boreskruemaskine", ArticleType.Standard, AreaWorkshopId, "Kompakt maskine til let montage.", "Milwaukee", "M12", null, null, false, null, ArticleStatus.Archived, "Vaerktoejsskab", timestamp),
            8 => ConfigureSeedArticle(article, ArticleWagoId, "Wago 221-413", ArticleType.Stock, AreaElectricalId, "3-leder samlemuffer til standard elarbejde.", "Wago", "221-413", "stk", 18, false, null, ArticleStatus.Active, "Elkasse", timestamp),
            _ => ConfigureSeedArticle(article, ArticlePtfeId, "PTFE tape 12mm", ArticleType.Stock, AreaPlumbingId, "Bruges ved mindre VVS-opgaver.", null, null, "rulle", 3, false, null, ArticleStatus.Active, "VVS kasse", timestamp)
        };
    }

    private static Article ConfigureSeedArticle(
        Article article,
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
        DateTime timestamp)
    {
        article.LoadSeedState(
            id,
            name,
            articleType,
            areaId,
            note,
            brand,
            model,
            unit,
            quantity,
            isOnShoppingList,
            shoppingNote,
            status,
            typicalLocation,
            timestamp,
            timestamp);

        return article;
    }

    private static ArticleTag Link(Guid articleId, Guid tagId)
    {
        return new ArticleTag
        {
            ArticleId = articleId,
            TagId = tagId
        };
    }
}