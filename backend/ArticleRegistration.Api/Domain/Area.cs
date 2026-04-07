namespace ArticleRegistration.Api.Domain;

public sealed class Area
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public ICollection<Article> Articles { get; } = [];
}