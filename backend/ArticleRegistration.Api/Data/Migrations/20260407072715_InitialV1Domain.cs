using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ArticleRegistration.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialV1Domain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Areas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Areas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Articles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ArticleType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AreaId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Note = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Brand = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 30, nullable: true),
                    Quantity = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: true),
                    IsOnShoppingList = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShoppingNote = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    TypicalLocation = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Articles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Articles_Areas_AreaId",
                        column: x => x.AreaId,
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ArticleTags",
                columns: table => new
                {
                    ArticleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TagId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArticleTags", x => new { x.ArticleId, x.TagId });
                    table.ForeignKey(
                        name: "FK_ArticleTags_Articles_ArticleId",
                        column: x => x.ArticleId,
                        principalTable: "Articles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ArticleTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Areas",
                columns: new[] { "Id", "Name", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "IT", 10 },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Homelab", 20 },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Auto", 30 },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "Vaerksted", 40 },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "El", 50 },
                    { new Guid("66666666-6666-6666-6666-666666666666"), "VVS", 60 }
                });

            migrationBuilder.InsertData(
                table: "Tags",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "netvaerk" },
                    { new Guid("aaaaaaaa-2222-2222-2222-222222222222"), "cat6" },
                    { new Guid("aaaaaaaa-3333-3333-3333-333333333333"), "rj45" },
                    { new Guid("aaaaaaaa-4444-4444-4444-444444444444"), "homelab" },
                    { new Guid("aaaaaaaa-5555-5555-5555-555555555555"), "server" },
                    { new Guid("aaaaaaaa-6666-6666-6666-666666666666"), "storage" },
                    { new Guid("aaaaaaaa-7777-7777-7777-777777777777"), "olie" },
                    { new Guid("aaaaaaaa-8888-8888-8888-888888888888"), "renault" },
                    { new Guid("aaaaaaaa-9999-9999-9999-999999999999"), "vaerktoej" },
                    { new Guid("bbbbbbbb-1111-1111-1111-111111111111"), "el" },
                    { new Guid("bbbbbbbb-2222-2222-2222-222222222222"), "vvs" },
                    { new Guid("bbbbbbbb-3333-3333-3333-333333333333"), "forbrug" }
                });

            migrationBuilder.InsertData(
                table: "Articles",
                columns: new[] { "Id", "AreaId", "ArticleType", "Brand", "CreatedAtUtc", "IsOnShoppingList", "Model", "Name", "Note", "Quantity", "ShoppingNote", "Status", "TypicalLocation", "Unit", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("11111111-1111-1111-1111-111111111111"), "Stock", null, new DateTime(2026, 1, 1, 12, 0, 0, 0, DateTimeKind.Utc), true, null, "RJ45 stik CAT6", "Pose med stik til terminering af kabler.", 0m, "Koeb ny pose med mindst 25 stk", "Active", "Sortimentskasse A3", "stk", new DateTime(2026, 1, 1, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new Guid("11111111-1111-1111-1111-111111111111"), "Stock", null, new DateTime(2026, 1, 2, 12, 0, 0, 0, DateTimeKind.Utc), false, null, "Patchkabel CAT6 0.5m", null, 6m, null, "Active", "Kabelkasse", "stk", new DateTime(2026, 1, 2, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new Guid("22222222-2222-2222-2222-222222222222"), "Standard", "Dell", new DateTime(2026, 1, 3, 12, 0, 0, 0, DateTimeKind.Utc), false, "OptiPlex 7070 Micro", "Dell OptiPlex 7070 Micro", "Bruges som Proxmox node i homelab.", null, null, "Active", "Rack hylde 2", null, new DateTime(2026, 1, 3, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("22222222-2222-2222-2222-222222222222"), "Stock", "Samsung", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc), false, "PM883", "Samsung PM883 1.92TB SSD", "Ekstra SSD til homelab og testservere.", 2m, null, "Active", "ESD kasse", "stk", new DateTime(2026, 1, 4, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new Guid("33333333-3333-3333-3333-333333333333"), "Stock", null, new DateTime(2026, 1, 5, 12, 0, 0, 0, DateTimeKind.Utc), true, null, "Motorolie 5W-30 5L", "Passer til Renault Kadjar 1.3 TCe.", 0m, "Husk OEM-specifikation RN17", "Active", "Garagehylde", "dunk", new DateTime(2026, 1, 5, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000006"), new Guid("33333333-3333-3333-3333-333333333333"), "Standard", "Renault", new DateTime(2026, 1, 6, 12, 0, 0, 0, DateTimeKind.Utc), false, "17 tommer", "Renault Kadjar alufaelge 17 tommer", "Originalt sommerhjulsaet.", null, null, "Active", "Garageloft", null, new DateTime(2026, 1, 6, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000007"), new Guid("44444444-4444-4444-4444-444444444444"), "Stock", null, new DateTime(2026, 1, 7, 12, 0, 0, 0, DateTimeKind.Utc), false, null, "Torx bits T20", "Loese bits til hurtig udskiftning.", 4m, null, "Active", "Bitskuffe", "stk", new DateTime(2026, 1, 7, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000008"), new Guid("44444444-4444-4444-4444-444444444444"), "Standard", "Milwaukee", new DateTime(2026, 1, 8, 12, 0, 0, 0, DateTimeKind.Utc), false, "M12", "Milwaukee M12 boreskruemaskine", "Kompakt maskine til let montage.", null, null, "Archived", "Vaerktoejsskab", null, new DateTime(2026, 1, 8, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000009"), new Guid("55555555-5555-5555-5555-555555555555"), "Stock", "Wago", new DateTime(2026, 1, 9, 12, 0, 0, 0, DateTimeKind.Utc), false, "221-413", "Wago 221-413", "3-leder samlemuffer til standard elarbejde.", 18m, null, "Active", "Elkasse", "stk", new DateTime(2026, 1, 9, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("10000000-0000-0000-0000-000000000010"), new Guid("66666666-6666-6666-6666-666666666666"), "Stock", null, new DateTime(2026, 1, 10, 12, 0, 0, 0, DateTimeKind.Utc), false, null, "PTFE tape 12mm", "Bruges ved mindre VVS-opgaver.", 3m, null, "Active", "VVS kasse", "rulle", new DateTime(2026, 1, 10, 12, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "ArticleTags",
                columns: new[] { "ArticleId", "TagId" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("aaaaaaaa-1111-1111-1111-111111111111") },
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("aaaaaaaa-2222-2222-2222-222222222222") },
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("aaaaaaaa-3333-3333-3333-333333333333") },
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("bbbbbbbb-3333-3333-3333-333333333333") },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new Guid("aaaaaaaa-1111-1111-1111-111111111111") },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new Guid("aaaaaaaa-2222-2222-2222-222222222222") },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new Guid("aaaaaaaa-4444-4444-4444-444444444444") },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new Guid("aaaaaaaa-5555-5555-5555-555555555555") },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("aaaaaaaa-4444-4444-4444-444444444444") },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("aaaaaaaa-5555-5555-5555-555555555555") },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("aaaaaaaa-6666-6666-6666-666666666666") },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new Guid("aaaaaaaa-7777-7777-7777-777777777777") },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new Guid("aaaaaaaa-8888-8888-8888-888888888888") },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new Guid("bbbbbbbb-3333-3333-3333-333333333333") },
                    { new Guid("10000000-0000-0000-0000-000000000006"), new Guid("aaaaaaaa-8888-8888-8888-888888888888") },
                    { new Guid("10000000-0000-0000-0000-000000000007"), new Guid("aaaaaaaa-9999-9999-9999-999999999999") },
                    { new Guid("10000000-0000-0000-0000-000000000007"), new Guid("bbbbbbbb-3333-3333-3333-333333333333") },
                    { new Guid("10000000-0000-0000-0000-000000000008"), new Guid("aaaaaaaa-9999-9999-9999-999999999999") },
                    { new Guid("10000000-0000-0000-0000-000000000009"), new Guid("bbbbbbbb-1111-1111-1111-111111111111") },
                    { new Guid("10000000-0000-0000-0000-000000000009"), new Guid("bbbbbbbb-3333-3333-3333-333333333333") },
                    { new Guid("10000000-0000-0000-0000-000000000010"), new Guid("bbbbbbbb-2222-2222-2222-222222222222") },
                    { new Guid("10000000-0000-0000-0000-000000000010"), new Guid("bbbbbbbb-3333-3333-3333-333333333333") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Areas_Name",
                table: "Areas",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Articles_AreaId",
                table: "Articles",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_Name",
                table: "Articles",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_Status_IsOnShoppingList_ArticleType",
                table: "Articles",
                columns: new[] { "Status", "IsOnShoppingList", "ArticleType" });

            migrationBuilder.CreateIndex(
                name: "IX_ArticleTags_TagId",
                table: "ArticleTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "Tags",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArticleTags");

            migrationBuilder.DropTable(
                name: "Articles");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Areas");
        }
    }
}
