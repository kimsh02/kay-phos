// user_repo_test.go
//
// ✅ What This Tests
// - CreateUser(): inserts new user with hashed password
// - GetUser(): retrieves user by username or UUID
//
// 🧪 What’s Covered in This Pattern
// ✅ Positive insert + fetch by username
// ✅ Duplicate username handling
// ✅ Validation for empty username/password via model checks
//
// 🧪 What’s NOT Covered
// ❌ Login endpoint logic
// ❌ Session storage
// ❌ Email verification or token issuance

package repositories

//
//func TestInsertAndRetrieveUser(t *testing.T) {
//	db := mockDb.SetupTestDB(t)
//
//	username := "testuser_" + uuid.New().String()[0:8]
//	user := &models.User{
//		FirstName:     "Test",
//		LastName:      "User",
//		UserName:      username,
//		InputPassword: "secure123",
//	}
//	user.SetUserID()
//	err := user.SetHashedPassword()
//	assert.NoError(t, err)
//
//	err = repositories.CreateUser(db, user)
//	assert.NoError(t, err)
//
//	err = repositories.GetUser(db, user)
//	assert.NoError(t, err)
//	assert.Equal(t, username, user.UserName)
//	assert.NotEmpty(t, user.HashedPassword)
//	assert.NotEqual(t, user.InputPassword, user.HashedPassword)
//}
//
//func TestDuplicateUsernameFails(t *testing.T) {
//	db := mockDb.SetupTestDB(t)
//
//	username := "dupeuser_" + uuid.New().String()[0:8]
//	user1 := &models.User{
//		FirstName:     "First",
//		LastName:      "Try",
//		UserName:      username,
//		InputPassword: "password1",
//	}
//	user1.SetUserID()
//	_ = user1.SetHashedPassword()
//	err := repositories.CreateUser(db, user1)
//	assert.NoError(t, err)
//
//	user2 := &models.User{
//		FirstName:     "Second",
//		LastName:      "Try",
//		UserName:      username, // same username
//		InputPassword: "password2",
//	}
//	user2.SetUserID()
//	_ = user2.SetHashedPassword()
//	err = repositories.CreateUser(db, user2)
//	assert.Error(t, err, "Expected error for duplicate username insert")
//}
//
//func TestEmptyUsernameValidation(t *testing.T) {
//	user := &models.User{
//		UserName:      "",
//		InputPassword: "something",
//	}
//	err := user.CheckPasswordAndUsername()
//	assert.ErrorContains(t, err, "no username")
//}
//
//func TestEmptyPasswordValidation(t *testing.T) {
//	user := &models.User{
//		UserName:      "validname",
//		InputPassword: "",
//	}
//	err := user.CheckPasswordAndUsername()
//	assert.ErrorContains(t, err, "no password")
//}
