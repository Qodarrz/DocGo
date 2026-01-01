const prisma = require("../db/prisma");

/**
 * CREATE APP RELEASE (UPLOAD LINK APK)
 */
async function createAppRelease(req, res) {
  try {
    const {
      appName,
      platform,
      versionName,
      versionCode,
      downloadUrl,
      releaseNotes,
      isForceUpdate,
      isActive,
    } = req.body;

    if (!versionName || !versionCode || !downloadUrl) {
      return res.status(400).json({
        error: "versionName, versionCode, and downloadUrl are required",
      });
    }

    // Jika release baru di-set aktif, nonaktifkan release lain di platform yang sama
    if (isActive === true) {
      await prisma.appRelease.updateMany({
        where: { platform },
        data: { isActive: false },
      });
    }

    const release = await prisma.appRelease.create({
      data: {
        appName: appName || "HealthApp",
        platform: platform || "ANDROID",
        versionName,
        versionCode: Number(versionCode),
        downloadUrl,
        releaseNotes: releaseNotes || null,
        isForceUpdate: isForceUpdate ?? false,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(release);
  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Version code already exists for this platform",
      });
    }

    res.status(500).json({ error: "Failed to create app release" });
  }
}

/**
 * LIST ALL APP RELEASES
 */
async function listAppReleases(req, res) {
  try {
    const { platform } = req.query;

    const releases = await prisma.appRelease.findMany({
      where: platform ? { platform } : {},
      orderBy: { versionCode: "desc" },
    });

    res.json(releases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch app releases" });
  }
}

/**
 * GET ACTIVE RELEASE (PUBLIC / MOBILE CHECK UPDATE)
 */
async function getActiveAppRelease(req, res) {
  try {
    const { platform = "ANDROID" } = req.query;

    const release = await prisma.appRelease.findFirst({
      where: {
        platform,
        isActive: true,
      },
      orderBy: {
        versionCode: "desc",
      },
    });

    if (!release) {
      return res.status(404).json({ error: "No active release found" });
    }

    res.json(release);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active release" });
  }
}

/**
 * UPDATE APP RELEASE
 */
async function updateAppRelease(req, res) {
  try {
    const releaseId = req.params.id;

    const {
      appName,
      platform,
      versionName,
      versionCode,
      downloadUrl,
      releaseNotes,
      isForceUpdate,
      isActive,
    } = req.body;

    const existing = await prisma.appRelease.findUnique({
      where: { id: releaseId },
    });

    if (!existing) {
      return res.status(404).json({ error: "App release not found" });
    }

    // Jika diaktifkan, nonaktifkan release lain di platform yang sama
    if (isActive === true) {
      await prisma.appRelease.updateMany({
        where: {
          platform: platform || existing.platform,
          NOT: { id: releaseId },
        },
        data: { isActive: false },
      });
    }

    const updated = await prisma.appRelease.update({
      where: { id: releaseId },
      data: {
        appName: appName ?? existing.appName,
        platform: platform ?? existing.platform,
        versionName: versionName ?? existing.versionName,
        versionCode:
          versionCode !== undefined
            ? Number(versionCode)
            : existing.versionCode,
        downloadUrl: downloadUrl ?? existing.downloadUrl,
        releaseNotes:
          releaseNotes !== undefined ? releaseNotes : existing.releaseNotes,
        isForceUpdate:
          isForceUpdate !== undefined ? isForceUpdate : existing.isForceUpdate,
        isActive:
          isActive !== undefined
            ? typeof isActive === "string"
              ? isActive === "true"
              : isActive
            : existing.isActive,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update app release" });
  }
}

/**
 * DELETE APP RELEASE
 */
async function deleteAppRelease(req, res) {
  try {
    const releaseId = req.params.id;

    const existing = await prisma.appRelease.findUnique({
      where: { id: releaseId },
    });

    if (!existing) {
      return res.status(404).json({ error: "App release not found" });
    }

    await prisma.appRelease.delete({
      where: { id: releaseId },
    });

    res.json({ message: "App release deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete app release" });
  }
}

module.exports = {
  createAppRelease,
  listAppReleases,
  getActiveAppRelease,
  updateAppRelease,
  deleteAppRelease,
};
