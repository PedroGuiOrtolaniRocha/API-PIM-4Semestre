FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY SuporteAPI/SuporteAPI/SuporteAPI.csproj SuporteAPI/
COPY SuporteAPI/ SuporteAPI/
WORKDIR /src/SuporteAPI
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
RUN chmod -R 755 /app
COPY --from=build /app/publish .
EXPOSE 5262
ENTRYPOINT ["dotnet", "SuporteAPI.dll"]
