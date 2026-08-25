using System.Text.Json.Serialization;
using MiniERP.Server.DTOs;

namespace MiniERP.Server.Services;

public class AresService {
    private readonly HttpClient _httpClient;

    public AresService(HttpClient httpClient) {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/");
    }

    
    public async Task<AresCompanyDTO?> GetByIcoAsync(string ico) {
        var response = await _httpClient.GetAsync(ico);
        if (!response.IsSuccessStatusCode) return null;

        var data = await response.Content.ReadFromJsonAsync<AresResponse>();
        if (data == null) return null;

        var street = data.Sidlo?.TextovaAdresa?.Split(',').FirstOrDefault()?.Trim() ?? string.Empty;

        return new AresCompanyDTO {
            Ico = data.Ico ?? ico,
            Name = data.ObchodniJmeno ?? string.Empty,
            Street = street,
            City = data.Sidlo?.NazevObce ?? string.Empty,
            Zip = data.Sidlo?.Psc?.ToString() ?? string.Empty,
            Dic = data.Dic ?? string.Empty,
        };
    }

    private class AresResponse {
        [JsonPropertyName("ico")] public string? Ico { get; set; }
        [JsonPropertyName("obchodniJmeno")] public string? ObchodniJmeno { get; set; }
        [JsonPropertyName("dic")] public string? Dic { get; set; }
        [JsonPropertyName("sidlo")] public AresSidlo? Sidlo { get; set; }
    }

    private class AresSidlo {
        [JsonPropertyName("nazevObce")] public string? NazevObce { get; set; }
        [JsonPropertyName("psc")] public int? Psc { get; set; }
        [JsonPropertyName("textovaAdresa")] public string? TextovaAdresa { get; set; }
    }
}
