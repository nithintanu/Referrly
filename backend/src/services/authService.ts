import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  AppError,
  ensureValidRole,
  generateToken,
  normalizeEmail,
  normalizeOptionalString,
  parseSkills,
  publicUserSelect,
  sanitizeUser,
  serializeSkills,
} from "../utils/helpers";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
  company?: string | null;
  skills?: string[] | string;
  experience?: number | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}

interface UpdateProfileInput {
  name?: string;
  email?: string;
  company?: string | null;
  skills?: string[] | string;
  experience?: number | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}

const PUBLIC_REGISTRATION_ROLES: Role[] = ["SEEKER", "REFERRER"];

export const authService = {
  async register({
    email,
    password,
    name,
    role = "SEEKER",
    company,
    skills,
    experience,
    bio,
    linkedinUrl,
    portfolioUrl,
  }: RegisterInput) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = name.trim();
    const selectedRole = ensureValidRole(role, PUBLIC_REGISTRATION_ROLES);
    const parsedSkills = parseSkills(skills ?? []);
    const sanitizedCompany = normalizeOptionalString(company);
    const sanitizedBio = normalizeOptionalString(bio);
    const sanitizedLinkedinUrl = normalizeOptionalString(linkedinUrl);
    const sanitizedPortfolioUrl = normalizeOptionalString(portfolioUrl);
    const sanitizedExperience =
      typeof experience === "number" && Number.isFinite(experience)
        ? Math.max(0, experience)
        : experience === null || experience === undefined
          ? null
          : undefined;

    if (normalizedName.length < 2) {
      throw new AppError(400, "Name must be at least 2 characters long");
    }

    if (password.length < 8) {
      throw new AppError(400, "Password must be at least 8 characters long");
    }

    if (selectedRole === "REFERRER") {
      if (!sanitizedCompany) {
        throw new AppError(400, "Company is required for referrers");
      }

      if (parsedSkills.length === 0) {
        throw new AppError(400, "At least one skill is required for referrers");
      }

      if (!sanitizedBio) {
        throw new AppError(400, "Bio is required for referrers");
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new AppError(409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: normalizedName,
        role: selectedRole,
        company: sanitizedCompany,
        skills: serializeSkills(parsedSkills),
        experience: sanitizedExperience,
        profile: {
          create: {
            bio: sanitizedBio,
            linkedinUrl: sanitizedLinkedinUrl,
            portfolioUrl: sanitizedPortfolioUrl,
          },
        },
      },
      select: publicUserSelect,
    });

    return {
      user: sanitizeUser(user),
      token: generateToken(user.id, user.role),
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    return {
      user: sanitizeUser(user),
      token: generateToken(user.id, user.role),
    };
  },

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return sanitizeUser(user);
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!existingUser) {
      throw new AppError(404, "User not found");
    }

    const normalizedEmail = data.email ? normalizeEmail(data.email) : undefined;

    if (normalizedEmail && normalizedEmail !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (emailTaken) {
        throw new AppError(409, "Email is already in use");
      }
    }

    const parsedSkills = data.skills !== undefined ? parseSkills(data.skills) : undefined;
    const sanitizedExperience =
      typeof data.experience === "number" && Number.isFinite(data.experience)
        ? Math.max(0, data.experience)
        : data.experience === null
          ? null
          : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name?.trim() || undefined,
        email: normalizedEmail,
        company: data.company === undefined ? undefined : normalizeOptionalString(data.company),
        skills: parsedSkills === undefined ? undefined : serializeSkills(parsedSkills),
        experience: sanitizedExperience,
        profile: {
          upsert: {
            create: {
              bio: normalizeOptionalString(data.bio),
              linkedinUrl: normalizeOptionalString(data.linkedinUrl),
              portfolioUrl: normalizeOptionalString(data.portfolioUrl),
            },
            update: {
              bio: data.bio === undefined ? undefined : normalizeOptionalString(data.bio),
              linkedinUrl:
                data.linkedinUrl === undefined ? undefined : normalizeOptionalString(data.linkedinUrl),
              portfolioUrl:
                data.portfolioUrl === undefined ? undefined : normalizeOptionalString(data.portfolioUrl),
            },
          },
        },
      },
      select: publicUserSelect,
    });

    return sanitizeUser(updatedUser);
  },
};
