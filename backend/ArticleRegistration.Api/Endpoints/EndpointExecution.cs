namespace ArticleRegistration.Api.Endpoints;

public static class EndpointExecution
{
    public static async Task<IResult> ExecuteAsync(Func<Task<IResult>> action)
    {
        try
        {
            return await action();
        }
        catch (InvalidOperationException exception)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["request"] = [exception.Message]
            });
        }
        catch (Exception)
        {
            return Results.Problem(
                title: "Request failed",
                detail: "An unexpected error occurred while handling the request.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    public static IResult NotFound(string entityName)
    {
        return Results.NotFound(new
        {
            error = $"{entityName} was not found."
        });
    }
}