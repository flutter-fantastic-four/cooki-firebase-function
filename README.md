# 📦 Kakao Firebase Auth Function

이 Firebase Cloud Function은 **Kakao 로그인 토큰**을 받아 **Firebase Custom Token**을 생성해주는 인증 백엔드입니다.

## 🚀 배포
```bash
# Firebase CLI 로그인 및 초기화
firebase login
firebase init functions

# Firebase Functions 배포
firebase deploy --only functions
```


## 📲 클라이언트 호출 예시
```
final callable = FirebaseFunctions.instance.httpsCallable('kakaoCustomAuth');
final result = await callable.call({'token': kakaoAccessToken});
final customToken = result.data['custom_token'];
await FirebaseAuth.instance.signInWithCustomToken(customToken);
```

## 🛠️ 개발 시 주의사항
admin.json 파일은 절대 커밋하지 마세요 (.gitignore에 추가 필수)  
admin.json 파일은 공유된 slack 이나 firebase 프로젝트 설정에서 재 다운로드 가능합니다.
