using kdramahub_backend.Data;
using kdramahub_backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using kdramahub_backend.Helpers;

namespace kdramahub_backend.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public UserController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        // api/user/signup

        [HttpPost("signup")]
        public IActionResult SignUp([FromBody] User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
                return BadRequest("User already exists");

            user.Password = PasswordHasher.HashPassword(user.Password);

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Favorites = user.Favorites.Select(f => f.DramaId).ToList(),
                Watches = user.Watches.Select(w => w.DramaId).ToList()
            });
        }

        // api/user/login

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoggedUser loginData)
        {
            var user = _context.Users
                .Include(u => u.Favorites)
                .Include(u => u.Watches)
                .FirstOrDefault(u => u.Email == loginData.Email);

            if (user == null || !PasswordHasher.VerifyPassword(loginData.Password, user.Password))
                return BadRequest("Invalid credentials");

            return Ok(new
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Favorites = user.Favorites.Select(f => f.DramaId).ToList(),
                Watches = user.Watches.Select(w => w.DramaId).ToList()
            });
        }

        // api/user/userid/favorites

        [HttpPost("{userId}/favorites")]
        public IActionResult AddFavorite(int userId, [FromBody] int dramaId)
        {
            var user = _context.Users.Include(u => u.Favorites).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            if (!user.Favorites.Any(f => f.DramaId == dramaId))
            {
                user.Favorites.Add(new Favorite { UserId = userId, DramaId = dramaId });
                _context.SaveChanges();
            }

            return Ok(user.Favorites.Select(f => f.DramaId).ToList());
        }

        [HttpGet("{userId}/favorites")]
        public IActionResult GetFavorites(int userId)
        {
            var user = _context.Users.Include(u => u.Favorites).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            return Ok(user.Favorites.Select(f => f.DramaId).ToList());
        }

        [HttpDelete("{userId}/favorites/{dramaId}")]
        public IActionResult RemoveFavorite(int userId, int dramaId)
        {
            var user = _context.Users.Include(u => u.Favorites).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            var favorite = user.Favorites.FirstOrDefault(f => f.DramaId == dramaId);
            if (favorite != null)
            {
                _context.Favorites.Remove(favorite);
                _context.SaveChanges();
            }

            return Ok(user.Favorites.Select(f => f.DramaId).ToList());
        }

        // api/user/userid/favorites/details

        [HttpGet("{userId}/favorites/details")]
        public async Task<IActionResult> GetFavoritesWithDetails(int userId)
        {
            var user = _context.Users.Include(u => u.Favorites).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            var dramaIds = user.Favorites.Select(f => f.DramaId).ToList();
            if (!dramaIds.Any()) return Ok(new List<object>());

            var client = _httpClientFactory.CreateClient();
            var tasks = dramaIds.Select(async id =>
            {
                var json = await client.GetStringAsync(
                    $"https://api.themoviedb.org/3/tv/{id}?api_key=0ce5d43298c76d46ecbd9f0cad57864c");
                return JsonSerializer.Deserialize<object>(json);
            });

            var results = await Task.WhenAll(tasks);
            return Ok(results);
        }

        // api/user/userid/watchlist

        [HttpPost("{userId}/watchlist")]
        public IActionResult AddWatch(int userId, [FromBody] int dramaId)
        {
            var user = _context.Users.Include(u => u.Watches).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            if (!user.Watches.Any(w => w.DramaId == dramaId))
            {
                user.Watches.Add(new Watch { UserId = userId, DramaId = dramaId });
                _context.SaveChanges();
            }

            return Ok(user.Watches.Select(w => w.DramaId).ToList());
        }

        [HttpGet("{userId}/watchlist")]
        public IActionResult GetWatch(int userId)
        {
            var user = _context.Users.Include(u => u.Watches).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            return Ok(user.Watches.Select(w => w.DramaId).ToList());
        }

        [HttpDelete("{userId}/watchlist/{dramaId}")]
        public IActionResult RemoveWatch(int userId, int dramaId)
        {
            var user = _context.Users.Include(u => u.Watches).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            var watch = user.Watches.FirstOrDefault(w => w.DramaId == dramaId);
            if (watch != null)
            {
                _context.Watches.Remove(watch);
                _context.SaveChanges();
            }

            return Ok(user.Watches.Select(w => w.DramaId).ToList());
        }

        // api/user/userid/watchlist/details

        [HttpGet("{userId}/watchlist/details")]
        public async Task<IActionResult> GetWatchesWithDetails(int userId)
        {
            var user = _context.Users.Include(u => u.Watches).FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            var dramaIds = user.Watches.Select(w => w.DramaId).ToList();
            if (!dramaIds.Any()) return Ok(new List<object>());

            var client = _httpClientFactory.CreateClient();
            var tasks = dramaIds.Select(async id =>
            {
                var json = await client.GetStringAsync(
                    $"https://api.themoviedb.org/3/tv/{id}?api_key=0ce5d43298c76d46ecbd9f0cad57864c");
                return JsonSerializer.Deserialize<object>(json);
            });

            var results = await Task.WhenAll(tasks);
            return Ok(results);
        }

        // api/user/userid/change-password

        [HttpPost("{userId}/change-password")]
        public IActionResult ChangePassword(int userId, [FromBody] ChangePasswordModel model)
        {
            if (model == null ||
                string.IsNullOrEmpty(model.CurrentPassword) ||
                string.IsNullOrEmpty(model.NewPassword) ||
                string.IsNullOrEmpty(model.ConfirmPassword))
                return BadRequest("Invalid data sent");

            if (model.NewPassword != model.ConfirmPassword)
                return BadRequest("New passwords do not match");

            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound("User not found");

            if (!PasswordHasher.VerifyPassword(model.CurrentPassword, user.Password))
                return BadRequest("Current password is incorrect");

            user.Password = PasswordHasher.HashPassword(model.NewPassword);
            _context.SaveChanges();

            return Ok(new { message = "Password changed successfully" });
        }

        // api/user/userid

        [HttpDelete("{userId}")]
        public IActionResult DeleteUser(int userId)
        {
            var user = _context.Users
                .Include(u => u.Favorites)
                .Include(u => u.Watches)
                .FirstOrDefault(u => u.Id == userId);

            if (user == null) return NotFound("User not found");

            _context.Favorites.RemoveRange(user.Favorites);
            _context.Watches.RemoveRange(user.Watches);
            _context.Users.Remove(user);
            _context.SaveChanges();

            return Ok(new { message = "User deleted successfully" });
        }
    }
}

