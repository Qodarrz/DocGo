const ytSearch = require('yt-dlp-exec');
const prisma = require("../db/prisma");

class EducationController {
  
  async getPersonalizedEducation(req, res, next) {
    try {
      const userId = req.user.id;

      const activeDiseases = await prisma.userDisease.findMany({
        where: {
          userId: userId,
          status: "ACTIVE"
        },
        include: {
          disease: true
        }
      });

      let queryKeyword = "";
      if (activeDiseases.length > 0) {
        const diseaseName = activeDiseases[0].disease.name;
        queryKeyword = `gaya hidup sehat ${diseaseName}`;
      } else {
        queryKeyword = "gaya hidup sehat harian edukasi medis";
      }

      const limit = 4;
      const searchResult = await ytSearch(`ytsearch${limit}:${queryKeyword}`, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
      });

      const videos = searchResult.entries.map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration_string,
        channel: video.uploader,
        publishedAt: video.upload_date, // Format: YYYYMMDD
        description: video.description || "",
        likeCount: video.like_count ?? null,
        dislikeCount: video.dislike_count ?? null, // mungkin null
        viewCount: video.view_count ?? null,
      }));

      return res.json({
        success: true,
        metadata: {
          targetQuery: queryKeyword,
          diseaseFound: activeDiseases.length > 0 ? activeDiseases[0].disease.name : "Tidak ada Disease Yang Aktif, Silahkan Input Di Profile",
          totalResults: videos.length
        },
        data: videos
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EducationController();
