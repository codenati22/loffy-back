const logger = require("../utils/logger");

class StorageService {
  async uploadFile(supabase, bucket, filePath, file, contentType) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType || "application/octet-stream",
        });

      if (error) {
        throw new Error(`Failed to upload file to ${bucket}: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error(`Failed to generate public URL for file in ${bucket}`);
      }

      return urlData.publicUrl;
    } catch (error) {
      logger.error(`Error in StorageService.uploadFile: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(supabase, bucket, filePath) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        throw new Error(
          `Failed to delete file from ${bucket}: ${error.message}`
        );
      }
    } catch (error) {
      logger.error(`Error in StorageService.deleteFile: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new StorageService();
