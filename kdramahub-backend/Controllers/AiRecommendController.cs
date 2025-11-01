using kdramahub_backend.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace kdramahub_backend.Controllers
{
    [Route("api/ai")]
    [ApiController]
    public class AiRecommendController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;


        public AiRecommendController(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _config = config;
        }

        // api/ai/recommend
        [HttpPost("recommend")]
        public async Task<IActionResult> Recommend([FromBody] PreferenceRequest request)
        {
            var apiKey = Environment.GetEnvironmentVariable("Gemini__ApiKey")
                         ?? throw new Exception("Gemini__ApiKey not set!");
            var apiUrl = Environment.GetEnvironmentVariable("Gemini__ApiUrl")
                         ?? throw new Exception("Gemini__ApiUrl not set!");
            var modelName = "models/gemini-2.5-flash-preview-05-20";

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiUrl)) return StatusCode(500, "API configuration missing. Check your .env file.");

            var client = _httpClientFactory.CreateClient();

            var body = new
            {
                contents = new[]
                {
                    new {
                        role = "user",
                        parts = new[]
                        {
                            new { text = $"Recommend me 3 {request.Genre} K-Dramas with {request.Length} episodes. " +
           $"They should have a {request.Mood} and " +
           $"{(request.Gems ? "be hidden gems" : "be popular")}." +
           $" Recommend K-Dramas using this format:" +
           $" put each title inside double quotes, followed by " +
           $"a short one-sentence explanation why you recommended it, and then the next recommendation in a new line. No stars or bold formatting. No extra sentences"  }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(body);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(
                $"{apiUrl}/{modelName}:generateContent?key={apiKey}", httpContent);

            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, responseText);
            }

            var parsed = JsonSerializer.Deserialize<JsonElement>(responseText);

            var text = parsed
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            var matches = Regex.Matches(text, "\"(.*?)\"");
            var titles = matches
                .Select(m => m.Groups[1].Value)
                .Select(title => new
                {
                    name = title,
                    slug = title.ToLower().Replace(" ", "-").Replace("?", "").Replace("!", "") 
                })
                .ToList();

            return Ok(new
            {
                recommendation = text,
                titles
            });
        }
    }
}

