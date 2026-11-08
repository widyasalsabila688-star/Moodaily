
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Ganti IP ini jika alamat IPv4 laptop berubah.
const API_URL = "http://192.168.100.6:5000/api";

const COLORS = {
  background: "#F8F7F1",
  green: "#82977A",
  darkGreen: "#435B45",
  cream: "#EFEDE2",
  white: "#FFFFFF",
  text: "#303B32",
  muted: "#8B9288",
  peach: "#E9C6B2",
  border: "#E7E6DD",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [screen, setScreen] = useState("auth");
  const [tab, setTab] = useState("Beranda");

  const [contents, setContents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [activityName, setActivityName] = useState("");
  const [activityCategory, setActivityCategory] = useState("Workout");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Terjadi kesalahan.");
    }

    return result;
  };

  const loadData = async (userId) => {
    setLoading(true);

    try {
      const [contentResult, activityResult, favoriteResult] =
        await Promise.all([
          request("/contents"),
          request(`/activities/${userId}`),
          request(`/favorites/${userId}`),
        ]);

      setContents(contentResult.data || []);
      setActivities(activityResult.data || []);
      setFavorites(favoriteResult.data || []);
    } catch (error) {
      Alert.alert("Gagal memuat data", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Perhatian", "Email dan password wajib diisi.");
      return;
    }

    setBusy(true);

    try {
      const result = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      setUser(result.user);
      setToken(result.token || "");
      setScreen("app");
      setTab("Beranda");
      await loadData(result.user.userId);
    } catch (error) {
      Alert.alert("Login gagal", error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Perhatian", "Semua kolom wajib diisi.");
      return;
    }

    setBusy(true);

    try {
      const result = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      Alert.alert(
        "Registrasi berhasil!",
        "Silakan login menggunakan akun yang baru dibuat.",
        [
          {
            text: "Login",
            onPress: () => {
              setAuthMode("login");
              setPassword("");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Registrasi gagal", error.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setEmail("");
    setPassword("");
    setScreen("auth");
    setAuthMode("login");
  };

  const openContent = (content) => {
    setSelectedContent(content);
    setScreen("detail");
  };

  const addFavorite = async (content) => {
    if (!user) return;

    const existing = favorites.find(
      (item) => item.content?._id === content._id
    );

    try {
      if (existing) {
        await request(`/favorites/${existing._id}`, {
          method: "DELETE",
        });

        setFavorites((previous) =>
          previous.filter((item) => item._id !== existing._id)
        );

        Alert.alert("Berhasil", "Konten dihapus dari favorit.");
      } else {
        const result = await request("/favorites", {
          method: "POST",
          body: JSON.stringify({
            userId: user.userId,
            content: content._id,
          }),
        });

        setFavorites((previous) => [
          { ...result.data, content },
          ...previous,
        ]);

        Alert.alert("Berhasil", "Konten ditambahkan ke favorit!");
      }
    } catch (error) {
      Alert.alert("Gagal", error.message);
    }
  };

  const saveActivity = async () => {
    if (!activityName.trim() || !duration.trim()) {
      Alert.alert("Perhatian", "Nama aktivitas dan durasi wajib diisi.");
      return;
    }

    if (Number(duration) <= 0 || isNaN(Number(duration))) {
      Alert.alert("Perhatian", "Durasi harus berupa angka lebih dari 0.");
      return;
    }

    setBusy(true);

    try {
      await request("/activities", {
        method: "POST",
        body: JSON.stringify({
          userId: user.userId,
          activityName: activityName.trim(),
          category: activityCategory,
          duration: Number(duration),
          calories: Number(calories) || 0,
        }),
      });

      setActivityName("");
      setDuration("");
      setCalories("");

      const result = await request(`/activities/${user.userId}`);
      setActivities(result.data || []);

      Alert.alert("Berhasil!", "Aktivitas berhasil disimpan.");
    } catch (error) {
      Alert.alert("Gagal menyimpan", error.message);
    } finally {
      setBusy(false);
    }
  };

  const isFavorite = (contentId) =>
    favorites.some((item) => item.content?._id === contentId);

  const formatType = (type) => {
    if (!type) return "Wellness";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderContentCard = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.contentCard}
      onPress={() => openContent(item)}
      activeOpacity={0.8}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.contentImage} />
      ) : (
        <View style={[styles.contentImage, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 32 }}>🌿</Text>
        </View>
      )}

      <View style={styles.contentInfo}>
        <Text style={styles.category}>{formatType(item.type)}</Text>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentDescription} numberOfLines={2}>
          {item.description}
        </Text>
        {item.duration ? (
          <Text style={styles.duration}>◷ {item.duration}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderHome = () => {
    const recommendation =
      contents.find((item) => item.type === "workout") || contents[0];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.muted}>Selamat datang,</Text>
            <Text style={styles.greeting}>{user?.name || "Wellness Friend"} 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "W"}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroSmall}>YOUR DAILY DOSE OF</Text>
          <Text style={styles.heroTitle}>WELLNESS.</Text>
          <Text style={styles.heroDescription}>
            Take a little time for yourself. Your wellness journey starts here.
          </Text>
          <Text style={styles.heroEmoji}>🌿</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Daily Summary</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>⏱️</Text>
            <Text style={styles.summaryNumber}>
              {activities.reduce((sum, item) => sum + (Number(item.duration) || 0), 0)}
            </Text>
            <Text style={styles.summaryLabel}>Minutes</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>🔥</Text>
            <Text style={styles.summaryNumber}>
              {activities.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)}
            </Text>
            <Text style={styles.summaryLabel}>Kcal</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>💚</Text>
            <Text style={styles.summaryNumber}>{activities.length}</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Explore Your Wellness</Text>

        <View style={styles.categoryRow}>
          {[
            ["🧘", "Yoga"],
            ["🤸", "Pilates"],
            ["🌸", "Stretching"],
          ].map(([emoji, label]) => (
            <TouchableOpacity
              key={label}
              style={styles.categoryCard}
              onPress={() => setTab("Jelajahi")}
            >
              <Text style={{ fontSize: 25 }}>{emoji}</Text>
              <Text style={styles.categoryName}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recommended For You</Text>

        {recommendation ? (
          renderContentCard(recommendation)
        ) : (
          <Text style={styles.emptyText}>Belum ada rekomendasi konten.</Text>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setTab("Jelajahi")}
        >
          <Text style={styles.secondaryButtonText}>Explore All Content →</Text>
        </TouchableOpacity>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            "Take care of your body. It's the only place you have to live."
          </Text>
          <Text style={styles.quoteAuthor}>— Jim Rohn</Text>
        </View>
      </ScrollView>
    );
  };

  const renderExplore = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Explore</Text>
      <Text style={styles.pageSubtitle}>
        Find something good for your mind and body.
      </Text>

      {["workout", "video", "article", "nutrition"].map((type) => {
        const filtered = contents.filter((item) => item.type === type);

        if (!filtered.length) return null;

        return (
          <View key={type}>
            <Text style={styles.sectionTitle}>{formatType(type)}</Text>
            {filtered.map(renderContentCard)}
          </View>
        );
      })}

      {contents.length === 0 && (
        <Text style={styles.emptyText}>Belum ada konten tersedia.</Text>
      )}
    </ScrollView>
  );

  const renderDetail = () => {
    const item = selectedContent;
    if (!item) return null;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => setScreen("app")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>

        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.detailImage} />
        ) : (
          <View style={[styles.detailImage, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 48 }}>🌿</Text>
          </View>
        )}

        <Text style={styles.category}>{formatType(item.type)}</Text>
        <Text style={styles.detailTitle}>{item.title}</Text>

        {item.duration ? (
          <Text style={styles.duration}>◷ {item.duration}</Text>
        ) : null}

        <Text style={styles.detailDescription}>{item.description}</Text>

        {item.content ? (
          <Text style={styles.articleContent}>{item.content}</Text>
        ) : null}

        {item.videoUrl ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(item.videoUrl)}
          >
            <Text style={styles.primaryButtonText}>▶  Watch Video</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => addFavorite(item)}
        >
          <Text style={styles.secondaryButtonText}>
            {isFavorite(item._id) ? "♥  Remove Favorite" : "♡  Add to Favorites"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderActivities = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>My Activities</Text>
      <Text style={styles.pageSubtitle}>
        Keep track of your daily wellness progress.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Activity</Text>

        <Text style={styles.inputLabel}>Activity Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Morning Yoga"
          placeholderTextColor={COLORS.muted}
          value={activityName}
          onChangeText={setActivityName}
        />

        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.categoryChoices}>
          {["Workout", "Yoga", "Pilates", "Walking", "Other"].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setActivityCategory(item)}
              style={[
                styles.choice,
                activityCategory === item && styles.choiceActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  activityCategory === item && styles.choiceTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 30"
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <Text style={styles.inputLabel}>Calories (kcal)</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 120"
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveActivity}
          disabled={busy}
        >
          <Text style={styles.primaryButtonText}>
            {busy ? "Saving..." : "Save Activity"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Activity History</Text>

      {activities.length ? (
        activities.map((item) => (
          <View key={item._id} style={styles.historyCard}>
            <View style={styles.historyIcon}>
              <Text>🏃</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{item.activityName}</Text>
              <Text style={styles.muted}>{item.category || "Activity"}</Text>
              <Text style={styles.muted}>
                {item.duration} minutes · {item.calories || 0} kcal
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Belum ada aktivitas yang dicatat.</Text>
      )}
    </ScrollView>
  );

  const renderFavorites = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>My Favorites</Text>
      <Text style={styles.pageSubtitle}>
        Your saved wellness inspiration.
      </Text>

      {favorites.length ? (
        favorites.map((favorite) =>
          favorite.content ? (
            <View key={favorite._id}>
              {renderContentCard(favorite.content)}
              <TouchableOpacity
                onPress={() => addFavorite(favorite.content)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>Remove from Favorites</Text>
              </TouchableOpacity>
            </View>
          ) : null
        )
      ) : (
        <Text style={styles.emptyText}>
          Belum ada konten favorit. Yuk, simpan konten yang kamu suka!
        </Text>
      )}
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>My Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || "W"}
          </Text>
        </View>

        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.userId}>User ID: {user?.userId}</Text>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileInfoTitle}>About Moodaily</Text>
        <Text style={styles.profileInfoText}>
          Moodaily — Your Daily Dose of Wellness. A little reminder to take
          care of yourself every day.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAuth = () => (
    <ScrollView
      contentContainerStyle={styles.authContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.authLogo}>moodaily.</Text>
      <Text style={styles.authTagline}>YOUR DAILY DOSE OF WELLNESS</Text>

      <View style={styles.authCard}>
        <Text style={styles.authTitle}>
          {authMode === "login" ? "Welcome Back!" : "Create Account"}
        </Text>
        <Text style={styles.authSubtitle}>
          {authMode === "login"
            ? "Continue your wellness journey."
            : "Start your wellness journey with Moodaily."}
        </Text>

        {authMode === "register" && (
          <>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
            />
          </>
        )}

        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="name@email.com"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 6 characters"
          placeholderTextColor={COLORS.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={authMode === "login" ? handleLogin : handleRegister}
          disabled={busy}
        >
          <Text style={styles.primaryButtonText}>
            {busy
              ? "Please wait..."
              : authMode === "login"
              ? "Login"
              : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setAuthMode(authMode === "login" ? "register" : "login");
            setPassword("");
          }}
        >
          <Text style={styles.switchAuth}>
            {authMode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (tab) {
      case "Beranda":
        return renderHome();
      case "Jelajahi":
        return renderExplore();
      case "Aktivitas":
        return renderActivities();
      case "Favorit":
        return renderFavorites();
      case "Profil":
        return renderProfile();
      default:
        return renderHome();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {screen === "auth" ? (
        renderAuth()
      ) : screen === "detail" ? (
        <View style={styles.mainContent}>{renderDetail()}</View>
      ) : (
        <>
          <View style={styles.mainContent}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.darkGreen}
                style={{ marginTop: 50 }}
              />
            ) : (
              renderTabContent()
            )}
          </View>

          <View style={styles.bottomNav}>
            {[
              ["Beranda", "⌂"],
              ["Jelajahi", "⌕"],
              ["Aktivitas", "◷"],
              ["Favorit", "♡"],
              ["Profil", "○"],
            ].map(([label, icon]) => (
              <TouchableOpacity
                key={label}
                style={styles.navItem}
                onPress={() => {
                  setTab(label);
                  setScreen("app");
                }}
              >
                <Text
                  style={[
                    styles.navIcon,
                    tab === label && styles.navActive,
                  ]}
                >
                  {icon}
                </Text>
                <Text
                  style={[
                    styles.navLabel,
                    tab === label && styles.navActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  muted: {
    color: COLORS.muted,
    fontSize: 12,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.darkGreen,
    fontSize: 18,
    fontWeight: "700",
  },
  hero: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 22,
    padding: 24,
    marginBottom: 27,
    overflow: "hidden",
  },
  heroSmall: {
    color: "#D9E2D5",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 8,
  },
  heroDescription: {
    color: "#E5E9E0",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
    width: "85%",
  },
  heroEmoji: {
    fontSize: 45,
    position: "absolute",
    right: 17,
    bottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  summaryEmoji: {
    fontSize: 20,
    marginBottom: 7,
  },
  summaryNumber: {
    color: COLORS.darkGreen,
    fontSize: 20,
    fontWeight: "700",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderRadius: 15,
    paddingVertical: 17,
    alignItems: "center",
  },
  categoryName: {
    color: COLORS.darkGreen,
    fontWeight: "600",
    fontSize: 12,
    marginTop: 8,
  },
  contentCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  contentImage: {
    width: 105,
    height: 110,
    borderRadius: 12,
    backgroundColor: COLORS.cream,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentInfo: {
    flex: 1,
    paddingLeft: 13,
  },
  category: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contentTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
    marginTop: 5,
  },
  contentDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  duration: {
    color: COLORS.darkGreen,
    fontSize: 11,
    marginTop: 7,
  },
  quote: {
    backgroundColor: COLORS.cream,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 25,
  },
  quoteText: {
    color: COLORS.darkGreen,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 21,
  },
  quoteAuthor: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 9,
    textAlign: "right",
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 6,
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 15,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginVertical: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
  },
  navIcon: {
    color: COLORS.muted,
    fontSize: 23,
  },
  navLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
  navActive: {
    color: COLORS.darkGreen,
    fontWeight: "800",
  },
  backButton: {
    marginBottom: 17,
    paddingVertical: 5,
  },
  backText: {
    color: COLORS.darkGreen,
    fontWeight: "700",
    fontSize: 14,
  },
  detailImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: COLORS.cream,
  },
  detailTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 25,
    lineHeight: 32,
    marginTop: 8,
  },
  detailDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
  },
  articleContent: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 24,
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: COLORS.darkGreen,
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 20,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: COLORS.cream,
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: COLORS.darkGreen,
    fontSize: 13,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 17,
    marginTop: 10,
  },
  formTitle: {
    color: COLORS.darkGreen,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 15,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 13,
  },
  categoryChoices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  choice: {
    borderRadius: 20,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceActive: {
    backgroundColor: COLORS.darkGreen,
  },
  choiceText: {
    color: COLORS.darkGreen,
    fontSize: 11,
  },
  choiceTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  historyIcon: {
    backgroundColor: COLORS.cream,
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  removeButton: {
    alignSelf: "flex-end",
    marginTop: -5,
    marginBottom: 15,
    padding: 6,
  },
  removeText: {
    color: "#A65D50",
    fontSize: 11,
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: "center",
    padding: 25,
    marginTop: 18,
  },
  profileAvatar: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: COLORS.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    color: COLORS.darkGreen,
    fontSize: 30,
    fontWeight: "700",
  },
  profileName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 13,
  },
  profileEmail: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  userId: {
    color: COLORS.green,
    fontSize: 11,
    marginTop: 10,
  },
  profileInfo: {
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },
  profileInfoTitle: {
    color: COLORS.darkGreen,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },
  profileInfoText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 21,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#C98C7D",
    padding: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: "#A65D50",
    fontWeight: "700",
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  authLogo: {
    color: COLORS.darkGreen,
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
  },
  authTagline: {
    color: COLORS.green,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 30,
  },
  authCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
  },
  authTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  authSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
    marginBottom: 12,
  },
  switchAuth: {
    color: COLORS.darkGreen,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 20,
  },
});
