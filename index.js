const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const request = require("request-promise"); // requestMe 함수에서 사용하므로 필요

const serviceAccount = require("./admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

function requestMe(kakaoAccessToken) {
    return request({
        method: "GET",
        headers: { Authorization: "Bearer " + kakaoAccessToken },
        url: "https://kapi.kakao.com/v2/user/me",
    });
}

function updateOrCreateUser(userId, email, displayName, photoURL) {
    const updateParams = { displayName: displayName || email, email, photoURL };

    return admin
        .auth()
        .updateUser(userId, updateParams)
        .catch((error) => {
            if (error.code === "auth/user-not-found") {
                return admin.auth().createUser({ uid: userId, ...updateParams });
            }
            throw error;
        });
}

function createFirebaseToken(kakaoAccessToken) {
    return requestMe(kakaoAccessToken)
        .then((response) => {
            const body = JSON.parse(response);
            const userId = `kakao:${body.id}`;
            const nickname = body?.properties?.nickname;
            const profileImage = body?.properties?.profile_image;
            const email = body?.kakao_account?.email;
            return updateOrCreateUser(userId, email, nickname, profileImage);
        })
        .then((userRecord) => {
            return admin.auth().createCustomToken(userRecord.uid, {
                provider: "KAKAO",
            });
        });
}

exports.kakaoCustomAuth = onCall({ region: "asia-northeast3" }, (request) => {
    const token = request.data.token;
    if (!token || typeof token !== "string") {
        throw new Error("Token is required.");
    }

    return createFirebaseToken(token).then((firebaseToken) => {
        return { custom_token: firebaseToken };
    });
});
