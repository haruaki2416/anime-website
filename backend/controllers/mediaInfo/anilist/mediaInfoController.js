const expressAsyncHandler = require("express-async-handler");
const { requestMediaById } = require("../../anilistUtils/queryConstants");
const fetchOptions = require("../../anilistUtils/utils").fetchOptions;

exports.geMediaInfoOnAnilist = expressAsyncHandler(async (req, res) => {
    const reqQuery = req.query.query;
    const lang = req.query.lang || "ENGLISH";
    const anilistUrl = process.env.ANILIST_API_URL;

    if (!anilistUrl) {
        return res.status(503).json({ error: "AniList API is not configured" });
    }
    if (!reqQuery) {
        return res.status(400).json({ error: "A media ID is required" });
    }

    const redisClient = req.redisClient;
    const key = "v2:mediaInfo:any:anilist:" + reqQuery + ":lang-" + lang.toLowerCase();

    try {
        if (!req.query.authToken) {
            const value = await redisClient.get(key);
            if (value) {
                const cached = JSON.parse(value);
                if (cached && cached.id) {
                    return res.status(200).json({
                        message: `Media Info for ID: ${reqQuery}`,
                        result: cached
                    });
                }
            }
        }

        const graphqlQuery = {
            query: requestMediaById(Boolean(req.query.authToken)),
            variables: { id: reqQuery },
        };

        const response = await fetch(
            anilistUrl,
            fetchOptions({ graphqlQuery, authToken: req.query.authToken })
        );
        const payload = await response.json();

        if (!response.ok || !payload?.data?.Media) {
            console.error("AniList media lookup failed:", payload?.errors || response.status);
            return res.status(response.status >= 400 ? response.status : 502).json({
                error: "AniList did not return media details"
            });
        }

        const media = payload.data.Media;
        if (!req.query.authToken) {
            await redisClient.set(key, JSON.stringify(media), { EX: 3600 });
        }

        return res.status(200).json({
            message: `Media Info for ID: ${reqQuery}`,
            result: media
        });
    } catch (err) {
        console.error("Error in /media-info/anime/anilist route:", err);
        return res.status(502).json({ error: "Unable to retrieve AniList media details" });
    }
});
