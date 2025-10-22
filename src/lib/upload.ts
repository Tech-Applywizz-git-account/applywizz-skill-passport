import { supabase } from "@/lib/supabase";

/**
 * Uploads a file to your existing `client-docs` bucket in Supabase Storage.
 * Creates folders automatically under the given category.
 *
 * @param file      The file object from an <input type="file">
 * @param clientId  The Supabase user ID (or client_id)
 * @param folder    One of: "education" | "certifications" | "internships" | "projects" | "resumes" | "work-experience"
 * @returns         Public URL to the uploaded file
 */
export async function uploadToClientDocs(
  file: File,
  clientId: string,
  folder: "education" | "certifications" | "internships" | "projects" | "resumes" | "work-experience"
): Promise<string> {
  const bucket = "client-docs"; // ✅ your existing bucket
  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${clientId}/${filename}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
