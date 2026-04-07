namespace ArticleRegistration.Api.Contracts;

public sealed record AreaDto(Guid Id, string Name, int SortOrder);

public sealed record TagDto(Guid Id, string Name);

public sealed record CreateAreaRequest(string Name);

public sealed record CreateTagRequest(string Name);