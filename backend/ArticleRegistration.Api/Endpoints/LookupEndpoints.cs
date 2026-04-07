using ArticleRegistration.Api.Contracts;
using ArticleRegistration.Api.Services;

namespace ArticleRegistration.Api.Endpoints;

public static class LookupEndpoints
{
    public static IEndpointRouteBuilder MapLookupEndpoints(this IEndpointRouteBuilder app)
    {
        var areaGroup = app.MapGroup("/api/areas").WithTags("Areas");

        areaGroup.MapGet("/", async (ILookupService lookupService, CancellationToken cancellationToken) =>
        {
            var areas = await lookupService.GetAreasAsync(cancellationToken);
            return Results.Ok(areas);
        });

        // V1 keeps area management simple: creation is allowed to support forms and filters without admin screens.
        areaGroup.MapPost("/", async (CreateAreaRequest request, ILookupService lookupService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var area = await lookupService.CreateAreaAsync(request, cancellationToken);
                return Results.Ok(area);
            });
        });

        var tagGroup = app.MapGroup("/api/tags").WithTags("Tags");

        tagGroup.MapGet("/", async (string? q, ILookupService lookupService, CancellationToken cancellationToken) =>
        {
            var tags = await lookupService.GetTagsAsync(q, cancellationToken);
            return Results.Ok(tags);
        });

        tagGroup.MapPost("/", async (CreateTagRequest request, ILookupService lookupService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var tag = await lookupService.CreateTagAsync(request, cancellationToken);
                return Results.Ok(tag);
            });
        });

        return app;
    }
}