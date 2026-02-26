"use server";

import { createClient } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Types
type LoginResult = {
  error?: string;
  success?: boolean;
};

type SignupResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Login with email and password
 * Redirects staff to dashboard and customers to their account area.
 */
export async function login(formData: FormData): Promise<LoginResult> {
  const supabase = await createClient();

  // Validate input
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;

  // Attempt login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Determine role to decide where to redirect the user
  const user = data.user;

  let redirectPath = "/account";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role === "admin" ||
      profile?.role === "editor" ||
      profile?.role === "seo_manager"
    ) {
      redirectPath = "/dashboard";
    }
  }

  // Revalidate and redirect
  revalidatePath("/", "layout");
  redirect(redirectPath);
}

/**
 * Sign up new user
 * New users are created as `customer` and redirected to their account/profile
 * when email confirmation is not required. If confirmation is required, we
 * fall back to the existing \"check your email\" flow.
 */
export async function signup(formData: FormData): Promise<SignupResult> {
  const supabase = await createClient();

  // Validate input
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, fullName } = result.data;

  // Create user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;

  // If we already have a session/user (email confirmation disabled),
  // create the customer profile immediately and send them to their account.
  if (user) {
    // Ensure a corresponding profile with the `customer` role exists
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        role: "customer",
      },
      { onConflict: "id" }
    );

    revalidatePath("/", "layout");
    redirect("/account");
  }

  // Otherwise, fall back to email confirmation flow
  return {
    success: true,
    message: "Check your email to confirm your account",
  };
}

/**
 * Logout current user
 */
export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  formData: FormData
): Promise<LoginResult> {
  const supabase = await createClient();

  const result = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email } = result.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
  };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(formData: FormData): Promise<LoginResult> {
  const supabase = await createClient();

  const result = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { password } = result.data;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let redirectPath = "/account";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (
      profile?.role === "admin" ||
      profile?.role === "editor" ||
      profile?.role === "seo_manager"
    ) {
      redirectPath = "/dashboard";
    }
  }
  redirect(redirectPath);
}

/**
 * Login with OAuth provider
 */
export async function loginWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
