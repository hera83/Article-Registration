using ArticleRegistration.Api.Contracts;
using ArticleRegistration.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ArticleRegistration.Api.Endpoints;

public static class ArticleEndpoints
{
    public static IEndpointRouteBuilder MapArticleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/articles").WithTags("Articles");

        group.MapGet("/", async (
            [AsParameters] ArticleSearchQuery query,
            IArticleService articleService,
            CancellationToken cancellationToken) =>
        {
            var articles = await articleService.SearchAsync(query.ToRequest(), cancellationToken);
            return Results.Ok(articles);
        });

        group.MapGet("/shopping-list", async (IArticleService articleService, CancellationToken cancellationToken) =>
        {
            var articles = await articleService.GetShoppingListAsync(cancellationToken);
            return Results.Ok(articles);
        });

        group.MapGet("/{id:guid}", async (Guid id, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            var article = await articleService.GetByIdAsync(id, cancellationToken);
            return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
        });

        group.MapPost("/", async (ArticleUpsertRequest request, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.CreateAsync(request, cancellationToken);
                return Results.Created($"/api/articles/{article.Id}", article);
            });
        });

        group.MapPut("/{id:guid}", async (Guid id, ArticleUpsertRequest request, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.UpdateAsync(id, request, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapPatch("/{id:guid}/quantity", async (Guid id, QuantityUpdateRequest request, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.UpdateQuantityAsync(id, request.Quantity, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapPatch("/{id:guid}/shopping-list", async (Guid id, MarkForShoppingListRequest request, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.AddToShoppingListAsync(id, request.ShoppingNote, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapDelete("/{id:guid}/shopping-list", async (Guid id, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.RemoveFromShoppingListAsync(id, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapPatch("/{id:guid}/restock", async (Guid id, RestockFromShoppingListRequest request, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.RestockFromShoppingListAsync(id, request.Quantity, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapPatch("/{id:guid}/archive", async (Guid id, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.ArchiveAsync(id, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapPatch("/{id:guid}/reactivate", async (Guid id, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.ReactivateAsync(id, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        group.MapPatch("/{id:guid}/run-out", async (Guid id, RunOutRequest request, IArticleService articleService, CancellationToken cancellationToken) =>
        {
            return await EndpointExecution.ExecuteAsync(async () =>
            {
                var article = await articleService.SetOutOfStockAsync(id, request.ShoppingNote, cancellationToken);
                return article is null ? EndpointExecution.NotFound("Article") : Results.Ok(article);
            });
        });

        return app;
    }

    // Query binding is kept separate so the HTTP contract stays simple while the service gets a typed request object.
    public sealed class ArticleSearchQuery
    {
        public string? Query { get; init; }
        public string? ArticleType { get; init; }
        public string? Area { get; init; }
        public string? Tag { get; init; }
        public bool? OnShoppingList { get; init; }
        public ArticleLifecycleFilter Status { get; init; } = ArticleLifecycleFilter.Active;
        public StockStatusFilter StockStatus { get; init; } = StockStatusFilter.All;

        public ArticleSearchRequest ToRequest()
        {
            return new ArticleSearchRequest(Query, ArticleType, Area, Tag, OnShoppingList, Status, StockStatus);
        }
    }
}