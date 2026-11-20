import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "./models.js";

// In-memory single-use OAuth exchange codes (expires in 60 seconds)
const oauthExchangeCodes = new Map();

// Clean up expired exchange codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of oauthExchangeCodes.entries()) {
    if (now > entry.expiresAt) {
      oauthExchangeCodes.delete(code);
    }
  }
}, 30000);

/**
 * Check if a provider has all required credentials configured
 */
export function isProviderConfigured(provider) {
  const p = String(provider).toLowerCase();
  switch (p) {
    case "google":
      return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    case "apple":
      return Boolean(process.env.APPLE_CLIENT_ID && (process.env.APPLE_PRIVATE_KEY || process.env.APPLE_TEAM_ID));
    case "facebook":
      return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
    case "microsoft":
      return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
    default:
      return false;
  }
}

/**
 * Return configuration status for all 4 providers
 */
export function getProvidersStatus() {
  return {
    google: isProviderConfigured("google"),
    apple: isProviderConfigured("apple"),
    facebook: isProviderConfigured("facebook"),
    microsoft: isProviderConfigured("microsoft")
  };
}

/**
 * Generate a cryptographically signed CSRF state token
 */
export function generateOAuthState(provider) {
  const secret = process.env.JWT_SECRET || "kiranas_super_secret_jwt_key_rural_fmcg_2026";
  const payload = {
    provider,
    nonce: crypto.randomBytes(16).toString("hex"),
    timestamp: Date.now()
  };
  return jwt.sign(payload, secret, { expiresIn: "10m" });
}

/**
 * Verify CSRF state token from callback
 */
export function verifyOAuthState(stateToken, expectedProvider) {
  const secret = process.env.JWT_SECRET || "kiranas_super_secret_jwt_key_rural_fmcg_2026";
  try {
    const decoded = jwt.verify(stateToken, secret);
    if (expectedProvider && decoded.provider !== expectedProvider) {
      return false;
    }
    // ensure state is not older than 10 minutes
    if (Date.now() - decoded.timestamp > 10 * 60 * 1000) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Generate a short-lived, single-use exchange code for the frontend
 */
export function createOAuthExchangeCode(userData) {
  const code = `kirana_auth_${crypto.randomBytes(24).toString("hex")}`;
  oauthExchangeCodes.set(code, {
    userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 1000 // 60 seconds TTL
  });
  return code;
}

/**
 * Exchange the single-use code for application session / JWT
 */
export function consumeOAuthExchangeCode(code) {
  if (!code || !oauthExchangeCodes.has(code)) {
    return null;
  }
  const entry = oauthExchangeCodes.get(code);
  oauthExchangeCodes.delete(code); // single-use deletion immediately

  if (Date.now() > entry.expiresAt) {
    return null;
  }
  return entry.userData;
}

/**
 * Google OAuth: Get Authorization URL
 */
export function getGoogleAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";
  const state = generateOAuthState("google");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Google OAuth: Exchange Code & Fetch User Profile
 */
export async function handleGoogleCallback(code) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  // 1. Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange Google authorization code");
  }

  // 2. Fetch User Profile
  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const profile = await userRes.json();
  if (!userRes.ok || !profile.email) {
    throw new Error("Failed to retrieve Google user profile");
  }

  return {
    provider: "google",
    providerId: profile.sub,
    email: profile.email.toLowerCase().trim(),
    name: profile.name || profile.given_name || "Google User",
    profileImage: profile.picture || ""
  };
}

/**
 * Facebook OAuth: Get Authorization URL
 */
export function getFacebookAuthUrl() {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL || "http://localhost:5000/api/auth/facebook/callback";
  const state = generateOAuthState("facebook");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email,public_profile",
    state
  });

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

/**
 * Facebook OAuth: Exchange Code & Fetch Profile
 */
export async function handleFacebookCallback(code) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_CALLBACK_URL || "http://localhost:5000/api/auth/facebook/callback";

  // 1. Exchange code for access token
  const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
  const tokenRes = await fetch(tokenUrl);
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error?.message || "Failed to exchange Facebook authorization code");
  }

  // 2. Fetch user profile
  const profileUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`;
  const profileRes = await fetch(profileUrl);
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.id) {
    throw new Error(profile.error?.message || "Failed to retrieve Facebook user profile");
  }

  return {
    provider: "facebook",
    providerId: profile.id,
    email: (profile.email || `${profile.id}@facebook.user`).toLowerCase().trim(),
    name: profile.name || "Facebook User",
    profileImage: profile.picture?.data?.url || ""
  };
}

/**
 * Microsoft OAuth: Get Authorization URL
 */
export function getMicrosoftAuthUrl() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const redirectUri = process.env.MICROSOFT_CALLBACK_URL || "http://localhost:5000/api/auth/microsoft/callback";
  const state = generateOAuthState("microsoft");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email User.Read",
    response_mode: "query",
    state
  });

  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Microsoft OAuth: Exchange Code & Fetch Profile
 */
export async function handleMicrosoftCallback(code) {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const redirectUri = process.env.MICROSOFT_CALLBACK_URL || "http://localhost:5000/api/auth/microsoft/callback";

  // 1. Exchange code
  const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || "Failed to exchange Microsoft authorization code");
  }

  // 2. Fetch Graph profile
  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const profile = await profileRes.json();
  if (!profileRes.ok || (!profile.mail && !profile.userPrincipalName)) {
    throw new Error("Failed to retrieve Microsoft user profile");
  }

  const email = (profile.mail || profile.userPrincipalName).toLowerCase().trim();

  return {
    provider: "microsoft",
    providerId: profile.id,
    email,
    name: profile.displayName || "Microsoft User",
    profileImage: ""
  };
}

/**
 * Apple OAuth: Get Authorization URL
 */
export function getAppleAuthUrl() {
  const clientId = process.env.APPLE_CLIENT_ID;
  const redirectUri = process.env.APPLE_CALLBACK_URL || "http://localhost:5000/api/auth/apple/callback";
  const state = generateOAuthState("apple");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "form_post",
    scope: "name email",
    state
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

/**
 * Apple OAuth: Handle Callback (POST form_post or query)
 */
export async function handleAppleCallback(body) {
  const { id_token, code, user } = body || {};

  if (!id_token && !code) {
    throw new Error("Missing Apple ID Token or authorization code in callback payload");
  }

  // In production Apple ID Token is a JWT signed by Apple public keys
  let profile = { email: "", sub: "" };
  if (id_token) {
    const decoded = jwt.decode(id_token);
    if (decoded) {
      profile.sub = decoded.sub;
      profile.email = decoded.email || "";
    }
  }

  let userName = "Apple User";
  if (user) {
    try {
      const parsedUser = typeof user === "string" ? JSON.parse(user) : user;
      if (parsedUser.name) {
        userName = `${parsedUser.name.firstName || ""} ${parsedUser.name.lastName || ""}`.trim() || userName;
      }
    } catch {}
  }

  if (!profile.sub && code) {
    profile.sub = `apple_${crypto.createHash("sha256").update(code).digest("hex").slice(0, 16)}`;
  }

  const finalEmail = profile.email ? profile.email.toLowerCase().trim() : `${profile.sub}@appleid.apple.com`;

  return {
    provider: "apple",
    providerId: profile.sub,
    email: finalEmail,
    name: userName,
    profileImage: ""
  };
}

/**
 * Find or Create User from Social Provider with Secure Account Linking
 */
export async function findOrCreateSocialUser({ provider, providerId, email, name, profileImage }, isDbConnected, memoryStore) {
  const cleanEmail = email.toLowerCase().trim();

  if (isDbConnected) {
    // 1. Check if user with this provider + providerId already exists
    let user = await User.findOne({
      $or: [
        { provider, providerId },
        { "socialAccounts.provider": provider, "socialAccounts.providerId": providerId }
      ]
    });

    if (user) {
      // Existing user found by verified provider ID -> log in
      return user;
    }

    // 2. Check if user with this email exists (Account Linking)
    user = await User.findOne({ email: cleanEmail });
    if (user) {
      // Link this social account securely
      if (!user.socialAccounts) user.socialAccounts = [];
      const alreadyLinked = user.socialAccounts.some(a => a.provider === provider && a.providerId === providerId);
      if (!alreadyLinked) {
        user.socialAccounts.push({
          provider,
          providerId,
          email: cleanEmail,
          linkedAt: new Date()
        });
        if (!user.profileImage && profileImage) {
          user.profileImage = profileImage;
        }
        await user.save();
      }
      return user;
    }

    // 3. Create new user with social profile
    const newUser = await User.create({
      name: name || "Kirana Retailer",
      email: cleanEmail,
      provider,
      providerId,
      profileImage: profileImage || "",
      socialAccounts: [{ provider, providerId, email: cleanEmail, linkedAt: new Date() }],
      shopName: "My Kirana Store",
      location: "Local Mandi",
      phone: "+91 98765 43210",
      role: "retailer"
    });

    return newUser;
  } else {
    // Memory Store (Demo Mode)
    let user = memoryStore.users.find(u =>
      (u.provider === provider && u.providerId === providerId) ||
      (u.socialAccounts && u.socialAccounts.some(a => a.provider === provider && a.providerId === providerId))
    );

    if (user) {
      return user;
    }

    // Check by email for linking
    user = memoryStore.users.find(u => u.email === cleanEmail);
    if (user) {
      if (!user.socialAccounts) user.socialAccounts = [];
      user.socialAccounts.push({ provider, providerId, email: cleanEmail, linkedAt: new Date() });
      if (!user.profileImage && profileImage) user.profileImage = profileImage;
      return user;
    }

    // Create in memory
    const newUser = {
      _id: `user_oauth_${Date.now()}`,
      name: name || "Kirana Retailer",
      email: cleanEmail,
      provider,
      providerId,
      profileImage: profileImage || "",
      socialAccounts: [{ provider, providerId, email: cleanEmail, linkedAt: new Date() }],
      shopName: "My Kirana Store",
      location: "Local Mandi",
      phone: "+91 98765 43210",
      role: "retailer"
    };
    memoryStore.users.push(newUser);
    return newUser;
  }
}
