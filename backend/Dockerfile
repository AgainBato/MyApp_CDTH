# 1. Giai đoạn Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file sln và csproj để restore dependencies trước (tận dụng cache layer của Docker)
COPY *.sln .
COPY DrinkShop.WebApi/*.csproj DrinkShop.WebApi/
COPY DrinkShop.Application/*.csproj DrinkShop.Application/
COPY DrinkShop.Domain/*.csproj DrinkShop.Domain/
COPY DrinkShop.Infrastructure/*.csproj DrinkShop.Infrastructure/

RUN dotnet restore

# Copy toàn bộ source code còn lại
COPY . .

# Build và Publish
WORKDIR /src/DrinkShop.WebApi
RUN dotnet publish -c Release -o /app/publish

# 2. Giai đoạn Runtime (Chạy ứng dụng)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Copy file firebase-key.json nếu có (đảm bảo file này nằm ở root của project WebApi hoặc chỉnh đường dẫn cho đúng)
# COPY DrinkShop.WebApi/firebase-key.json . 

EXPOSE 8080
ENTRYPOINT ["dotnet", "DrinkShop.WebApi.dll"]