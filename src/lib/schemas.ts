import { z } from "zod";

/**
 * Login form validation schema.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema.
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ và tên")
      .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Profile update validation schema.
 */
export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ và tên")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(0|\+84)\d{9,10}$/.test(val),
      "Số điện thoại không hợp lệ"
    ),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, "Giới thiệu không quá 500 ký tự").optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
