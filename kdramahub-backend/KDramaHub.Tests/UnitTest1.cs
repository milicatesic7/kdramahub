using Xunit;
using Moq;
using kdramahub_backend.Controllers;
using kdramahub_backend.Data;
using kdramahub_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using kdramahub_backend.Helpers;

namespace KDramaHub.Tests
{
    public class UserControllerTests
    {
        private AppDbContext GetInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid())
                .Options;
            return new AppDbContext(options);
        }

        private Mock<IHttpClientFactory> GetMockHttpClientFactory()
        {
            var mockFactory = new Mock<IHttpClientFactory>();
            var client = new HttpClient(); 
            mockFactory.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(client);
            return mockFactory;
        }

        [Fact]
        public void SignUp_CreatesUserSuccessfully()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var user = new User { Name = "Alice", Email = "alice@test.com", Password = "password" };
            var result = controller.SignUp(user) as OkObjectResult;
            Assert.NotNull(result);

            var createdUser = context.Users.FirstOrDefault(u => u.Email == "alice@test.com");
            Assert.NotNull(createdUser);
            Assert.Equal("Alice", createdUser.Name);
            Assert.NotEqual("password", createdUser.Password);
        }

        [Fact]
        public void Login_ReturnsUser_WhenCredentialsAreCorrect()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var password = "password";
            var hashedPassword = PasswordHasher.HashPassword(password);

            var user = new User { Name = "Bob", Email = "bob@test.com", Password = hashedPassword };
            context.Users.Add(user);
            context.SaveChanges();

            var loginData = new LoggedUser { Email = "bob@test.com", Password = password };
            var result = controller.Login(loginData) as OkObjectResult;
            Assert.NotNull(result);

            dynamic data = result.Value;
            Assert.Equal("Bob", data.Name);
            Assert.Equal("bob@test.com", data.Email);
        }

        [Fact]
        public void Favorites_AddGetRemove_WorksCorrectly()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var user = new User { Name = "Carol", Email = "carol@test.com", Password = PasswordHasher.HashPassword("123") };
            context.Users.Add(user);
            context.SaveChanges();

            controller.AddFavorite(user.Id, 1);
            controller.AddFavorite(user.Id, 2);
            controller.AddFavorite(user.Id, 2); 

            var favorites = controller.GetFavorites(user.Id) as OkObjectResult;
            var favList = favorites.Value as List<int>;
            Assert.Contains(1, favList);
            Assert.Contains(2, favList);
            Assert.Single(favList.Where(x => x == 2)); 

            controller.RemoveFavorite(user.Id, 1);
            favorites = controller.GetFavorites(user.Id) as OkObjectResult;
            favList = favorites.Value as List<int>;
            Assert.DoesNotContain(1, favList);
            Assert.Contains(2, favList);

            controller.RemoveFavorite(user.Id, 99); 
        }

        [Fact]
        public void Watchlist_AddGetRemove_WorksCorrectly()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var user = new User { Name = "Dave", Email = "dave@test.com", Password = PasswordHasher.HashPassword("123") };
            context.Users.Add(user);
            context.SaveChanges();

            controller.AddWatch(user.Id, 10);
            controller.AddWatch(user.Id, 20);
            controller.AddWatch(user.Id, 20); 

            var watches = controller.GetWatch(user.Id) as OkObjectResult;
            var watchList = watches.Value as List<int>;
            Assert.Contains(10, watchList);
            Assert.Contains(20, watchList);
            Assert.Single(watchList.Where(x => x == 20)); 

            controller.RemoveWatch(user.Id, 10);
            watches = controller.GetWatch(user.Id) as OkObjectResult;
            watchList = watches.Value as List<int>;
            Assert.DoesNotContain(10, watchList);
            Assert.Contains(20, watchList);

            controller.RemoveWatch(user.Id, 99); 
        }

        [Fact]
        public void ChangePassword_WorksCorrectly()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var oldPassword = "oldpass";
            var hashedOld = PasswordHasher.HashPassword(oldPassword);
            var user = new User { Name = "Eve", Email = "eve@test.com", Password = hashedOld };
            context.Users.Add(user);
            context.SaveChanges();

            var model = new ChangePasswordModel
            {
                CurrentPassword = oldPassword,
                NewPassword = "newpass",
                ConfirmPassword = "newpass"
            };

            var result = controller.ChangePassword(user.Id, model) as OkObjectResult;
            Assert.NotNull(result);

            var updatedUser = context.Users.First(u => u.Id == user.Id);
            Assert.True(PasswordHasher.VerifyPassword("newpass", updatedUser.Password));
        }

        [Fact]
        public void DeleteUser_RemovesEverything()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var user = new User { Name = "Frank", Email = "frank@test.com", Password = PasswordHasher.HashPassword("123") };
            context.Users.Add(user);
            context.SaveChanges();

            controller.AddFavorite(user.Id, 1);
            controller.AddWatch(user.Id, 10);

            var deleteResult = controller.DeleteUser(user.Id) as OkObjectResult;
            Assert.NotNull(deleteResult);

            var deletedUser = context.Users.FirstOrDefault(u => u.Id == user.Id);
            Assert.Null(deletedUser);
        }

        [Fact]
        public void UserFullFlow_WorksCorrectly()
        {
            var context = GetInMemoryDb();
            var controller = new UserController(context, GetMockHttpClientFactory().Object);

            var user = new User { Name = "Eve", Email = "eve@test.com", Password = "mypassword" };
            var signupResult = controller.SignUp(user) as OkObjectResult;
            Assert.NotNull(signupResult);

            var createdUser = context.Users.FirstOrDefault(u => u.Email == "eve@test.com");
            Assert.NotNull(createdUser);

            var loginData = new LoggedUser { Email = "eve@test.com", Password = "mypassword" };
            var loginResult = controller.Login(loginData) as OkObjectResult;
            Assert.NotNull(loginResult);

            controller.AddFavorite(createdUser.Id, 101);
            controller.AddFavorite(createdUser.Id, 102);
            controller.AddFavorite(createdUser.Id, 103);

            var favResult = controller.GetFavorites(createdUser.Id) as OkObjectResult;
            var favList = favResult.Value as List<int>;
            Assert.Equal(3, favList.Count);
            Assert.Contains(101, favList);
            Assert.Contains(102, favList);
            Assert.Contains(103, favList);

            controller.RemoveFavorite(createdUser.Id, 102);
            favResult = controller.GetFavorites(createdUser.Id) as OkObjectResult;
            favList = favResult.Value as List<int>;
            Assert.Equal(2, favList.Count);
            Assert.DoesNotContain(102, favList);

            controller.AddWatch(createdUser.Id, 201);
            controller.AddWatch(createdUser.Id, 202);

            var watchResult = controller.GetWatch(createdUser.Id) as OkObjectResult;
            var watchList = watchResult.Value as List<int>;
            Assert.Equal(2, watchList.Count);
            Assert.Contains(201, watchList);
            Assert.Contains(202, watchList);

            controller.RemoveWatch(createdUser.Id, 201);
            watchResult = controller.GetWatch(createdUser.Id) as OkObjectResult;
            watchList = watchResult.Value as List<int>;
            Assert.Single(watchList);
            Assert.DoesNotContain(201, watchList);
            Assert.Contains(202, watchList);

            var finalFavs = controller.GetFavorites(createdUser.Id) as OkObjectResult;
            var finalWatches = controller.GetWatch(createdUser.Id) as OkObjectResult;

            Assert.Equal(new List<int> { 101, 103 }, finalFavs.Value as List<int>);
            Assert.Equal(new List<int> { 202 }, finalWatches.Value as List<int>);
        }
    }
}



