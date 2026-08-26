FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia absolutamente TUDO da raiz do seu projeto para o servidor
COPY . .

# Publica a pasta do AutoAtendimento (ele vai achar as referências do CRM sozinho)
RUN dotnet publish "AutoAtendimento/Api/API/" -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "OrbeB2B.AutoAtendimento.API.dll"]