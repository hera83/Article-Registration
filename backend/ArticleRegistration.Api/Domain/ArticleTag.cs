namespace ArticleRegistration.Api.Domain;

public sealed class ArticleTag
{
    public Guid ArticleId { get; set; }
    public Article Article { get; set; } = null!;
    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}