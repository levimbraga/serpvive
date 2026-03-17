# Supabase Email Templates — Setup Guide

## 1. Configure SMTP (Resend)

Go to **Supabase Dashboard → Settings → Authentication → SMTP Settings** and enable **Custom SMTP**:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your `RESEND_API_KEY` from `.env` |
| Sender email | `noreply@mail.serpvive.com` |
| Sender name | `SerpVive` |

> Make sure `mail.serpvive.com` is verified as a domain in Resend.

---

## 2. Configure Authentication Templates

Go to **Supabase Dashboard → Authentication → Email Templates**.

For each template type, click the template name, paste the **Subject** and **Body** (HTML) from the corresponding file:

### Authentication Templates

| # | Template Type | File | Subject |
|---|---|---|---|
| 1 | **Confirm sign up** | `01-confirm-signup.html` | `Welcome to SerpVive — confirm your email` |
| 2 | **Invite user** | `02-invite-user.html` | `You've been invited to SerpVive` |
| 3 | **Magic link** | `03-magic-link.html` | `Your SerpVive login link` |
| 4 | **Change email address** | `04-change-email.html` | `Confirm your new email address` |
| 5 | **Reset password** | `05-reset-password.html` | `Reset your SerpVive password` |
| 6 | **Reauthentication** | `06-reauthentication.html` | `SerpVive — confirm your identity` |

### Security Notification Templates

| # | Template Type | File | Subject |
|---|---|---|---|
| 7 | **Password changed** | `07-password-changed.html` | `Your SerpVive password was changed` |
| 8 | **Email address changed** | `08-email-changed.html` | `Your SerpVive email was changed` |
| 9 | **Phone number changed** | `09-phone-changed.html` | `Your SerpVive phone number was changed` |
| 10 | **Identity linked** | `10-identity-linked.html` | `New login method added to your SerpVive account` |
| 11 | **Identity unlinked** | `11-identity-unlinked.html` | `Login method removed from your SerpVive account` |
| 12 | **MFA method added** | `12-mfa-added.html` | `MFA enabled on your SerpVive account` |
| 13 | **MFA method removed** | `13-mfa-removed.html` | `MFA disabled on your SerpVive account` |

---

## 3. Enable Security Notifications

Go to **Supabase Dashboard → Authentication → Security** (or Auth Hooks/Notifications section).

Toggle **ON** for all security notifications:

- [x] Password changed
- [x] Email address changed
- [x] Phone number changed
- [x] Identity linked
- [x] Identity unlinked
- [x] MFA method added
- [x] MFA method removed

---

## 4. Template Variables Reference

These variables are available in Supabase Go templates:

| Variable | Description | Used in |
|---|---|---|
| `{{ .ConfirmationURL }}` | Action link (confirm, reset, etc.) | Templates 1-5, 7 |
| `{{ .Token }}` | 6-digit OTP code | Template 6 |
| `{{ .TokenHash }}` | Hash of the token | (available but not used) |
| `{{ .SiteURL }}` | Your site URL (serpvive.com) | Template 7 |
| `{{ .Email }}` | User's email | (available but not used) |
| `{{ .NewEmail }}` | New email address | Template 4 |

---

## 5. Testing

After configuring all templates:

1. **Test confirm signup**: Create a new account with a test email
2. **Test reset password**: Use "Forgot password" flow
3. **Test magic link**: If enabled, request a magic link login
4. **Test change email**: Change email in settings

Check that:
- Emails arrive (check spam folder)
- SerpVive branding is visible (dark header, blue logo)
- Buttons/links work correctly
- Footer text is present
