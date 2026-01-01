const fetch = require("node-fetch");

class BlobStorageService {
  constructor() {
    // Gunakan public subdomain supaya bisa diakses langsung
    this.baseUrl = "https://az4khupscvsqksn6.public.blob.vercel-storage.com";
    this.token = process.env.BLOB_READ_WRITE_TOKEN;
  }

  async uploadFile(fileBuffer, fileName, mimeType) {
    // Tambahkan token unik supaya URL publik bisa diakses
    const uniqueFileName = `${fileName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;
    const url = `${this.baseUrl}/${uniqueFileName}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": mimeType,
      },
      body: fileBuffer,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload gagal: ${res.status} ${text}`);
    }

    // kembalikan URL final yang bisa diakses publik
    return url;
  }
}

module.exports = new BlobStorageService();
