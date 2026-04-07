using ArticleRegistration.Api.Contracts;

namespace ArticleRegistration.Api.Services;

public interface ILookupService
{
    Task<IReadOnlyList<AreaDto>> GetAreasAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<TagDto>> GetTagsAsync(string? query, CancellationToken cancellationToken);
    Task<AreaDto> CreateAreaAsync(CreateAreaRequest request, CancellationToken cancellationToken);
    Task<TagDto> CreateTagAsync(CreateTagRequest request, CancellationToken cancellationToken);
}