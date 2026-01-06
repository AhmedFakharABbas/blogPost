import { connectToDatabase } from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import { unstable_cache } from "next/cache";

async function _getSiteSettings() {
  await connectToDatabase();
  const siteSettings = await SiteSettings.findOne({}).lean();
  return siteSettings;
}

// Cache site settings for 1 hour since they rarely change
export async function getSiteSettings() {
  return unstable_cache(
    _getSiteSettings,
    ['site-settings'],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ['site-settings'],
    }
  )();
}

