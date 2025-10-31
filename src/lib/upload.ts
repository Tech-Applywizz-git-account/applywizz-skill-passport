// import { supabase } from "@/lib/supabase";

// /**
//  * Uploads a file to your existing `client-docs` bucket in Supabase Storage.
//  * Creates folders automatically under the given category.
//  *
//  * @param file      The file object from an <input type="file">
//  * @param clientId  The Supabase user ID (or client_id)
//  * @param folder    One of: "education" | "certifications" | "internships" | "projects" | "resumes" | "work-experience"
//  * @returns         Public URL to the uploaded file
//  */
// export async function uploadToClientDocs(
//   file: File,
//   clientId: string,
//   folder: "education" | "certifications" | "internships" | "projects" | "resumes" | "work-experience"
// ): Promise<string> {
//   const bucket = "client-docs"; // ✅ your existing bucket
//   const ext = file.name.split(".").pop() || "bin";
//   const filename = `${crypto.randomUUID()}.${ext}`;
//   const path = `${folder}/${clientId}/${filename}`;

//   const { error } = await supabase.storage.from(bucket).upload(path, file, {
//     cacheControl: "3600",
//     upsert: false,
//     contentType: file.type || undefined,
//   });
//   if (error) throw error;

//   const { data } = supabase.storage.from(bucket).getPublicUrl(path);
//   return data.publicUrl;
// }


import { supabase } from "@/lib/supabase";

/**
 * Uploads a file to the existing `client-docs` bucket in Supabase Storage.
 * Creates nested folders automatically by category and client ID.
 * Validates file before upload and returns a public URL.
 */
export async function uploadToClientDocs(
  file: File,
  clientId: string,
  folder:
    | "education"
    | "certifications"
    | "internships"
    | "projects"
    | "resumes"
    | "work-experience"
): Promise<string> {
  const bucket = "client-docs";

  // ✅ Validate input
  if (!(file instanceof File)) {
    throw new Error("Invalid file object — expected a real File instance.");
  }
  if (file.size === 0) {
    throw new Error("File is empty — please select a valid PDF before uploading.");
  }

  // ✅ Build file path
  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${clientId}/${filename}`;

  // 👇 Added for debug
  console.log("Uploading work experience file for client:", clientId);
  console.log("Full path to be uploaded:", path);

  // ✅ Upload the file
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "application/pdf",
  });

  if (error) {
    console.error("Upload failed:", error);
    throw new Error("Upload failed — please try again.");
  }

  // ✅ Generate a public URL for direct browser viewing
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);

  if (!publicData?.publicUrl) {
    throw new Error("Could not generate a public URL.");
  }

  return publicData.publicUrl;
}
