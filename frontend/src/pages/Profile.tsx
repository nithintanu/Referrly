import { FormEvent, useEffect, useState } from "react";
import { Alert } from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    skills: "",
    experience: "",
    bio: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      name: user.name,
      email: user.email,
      company: user.company || "",
      skills: user.skills.join(", "),
      experience: user.experience?.toString() || "",
      bio: user.profile?.bio || "",
      linkedinUrl: user.profile?.linkedinUrl || "",
      portfolioUrl: user.profile?.portfolioUrl || "",
    });
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        experience: formData.experience ? Number(formData.experience) : null,
        bio: formData.bio,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
      });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Profile</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Manage your details</h1>
          <p className="mt-3 text-sm text-slate-600">
            Keep your identity, skills, and links current so the right people can evaluate your requests quickly.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Current role</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{user?.role}</p>
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <Alert message={error} /> : null}
          {success ? <Alert message={success} tone="success" /> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Company</label>
              <input
                value={formData.company}
                onChange={(event) => setFormData((current) => ({ ...current, company: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder={user?.role === "REFERRER" ? "Your current company" : "Target companies"}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Experience (years)</label>
              <input
                type="number"
                min={0}
                value={formData.experience}
                onChange={(event) => setFormData((current) => ({ ...current, experience: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Skills</label>
            <textarea
              rows={3}
              value={formData.skills}
              onChange={(event) => setFormData((current) => ({ ...current, skills: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(event) => setFormData((current) => ({ ...current, bio: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
              placeholder="Add a short professional summary."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(event) => setFormData((current) => ({ ...current, linkedinUrl: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Portfolio URL</label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(event) => setFormData((current) => ({ ...current, portfolioUrl: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
                placeholder="https://your-site.dev"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving profile..." : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
};
