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
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidate and redirect
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Sign up new user
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
  const { error } = await supabase.auth.signUp({
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

  // Check if email confirmation is required
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
  redirect("/login");
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
  redirect("/dashboard");
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
